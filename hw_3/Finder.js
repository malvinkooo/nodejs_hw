const EventEmitter = require('events');
const { readdir } = require('fs').promises;
const { extname } = require('path');
const path = require("path");
const chalk = require("chalk");

const { createReadStream, createWriteStream } = require("fs");
const FileType = require('file-type');

class Finder extends EventEmitter {
    constructor(deep, fileParams) {
        super();

        this._deep = deep;
        this._path = fileParams.currPath;
        this._ext = fileParams.ext;
        this._search = fileParams.search;
        this._regExp = new RegExp(fileParams.regExp);
        this._dirProcessCount = 0;
        this._fileProcessCount = 0;

        this._logFileName;

        this._interval = 2000;
        this._timer;

        this.on('file', this._setTimer);

        setTimeout(() => {
            this.emit('started');
        }, 0);
    }

    async parse() {
        this._logFileName = new Date(Date.now()).toLocaleString("ru-RU", {hour12: false}).replace(",", "").replace(/:/g, "-");

        this._setTimer();
        this._deep = (this._deep === 0) ? -1 : this._deep;

        const result = await this._parseDir(this._path, this._deep);

        this.emit('finished', result);
        clearTimeout(this._timer);
    }

    async _parseDir(currPath, deep) {
        let result = [];
        let items = [];

        const ws = createWriteStream(`./log/${this._logFileName}.txt`, {
            flags: "a"
        });

        if (deep === 0) {
            return result;
        }

        try {
            items = await this._readDir(currPath, {
                withFileTypes: true
            });
        } catch (err) {
            this.emit('error', err);
        }

        for (let element of items) {
            const elementPath = path.join(currPath, element.name);

            if (element.isDirectory()) {
                this._dirProcessCount++;
                const res = await this._parseDir(elementPath, deep -1);
                result.push(...res);
            } else if (element.isFile()) {

                this._fileProcessCount++;

                let res = element.name.match(this._regExp);
                if(res != null) {
                    const { isFileTypeMatched, ft } = await this._checkFileType(element, elementPath);

                    if(isFileTypeMatched) {
                        result.push(elementPath);
                        this.emit('file', elementPath);

                        if(this._isFileText(ft, extname(element.name)) && this._search) {
                            const findResult = await this._findInFile(elementPath, this._search);
                            if(findResult) {
                                const { beforeSubstr, afterSubstr } = findResult;
                                ws.write(`${beforeSubstr}${afterSubstr}`);
                            }
                        }
                    }
                }
            }
        }

        ws.end();

        return result;
    }
    
    _findInFile(elementPath, search) {
        return new Promise((resolve, reject) => {
            let tmp = "", prevChunkLength = 0;
            const rs = createReadStream(elementPath, {
                highWaterMark: 20,
                encoding: "utf-8",
            });

            rs.on("data", chunk => {
                tmp += chunk;

                const indexSubstr = tmp.indexOf(this._search);
                if(indexSubstr != -1) {
                    const beforeSubstr = tmp.substr(0, indexSubstr-1);
                    const afterSubstr = tmp.substr(indexSubstr+this._search.length, 20);

                    rs.destroy();

                    resolve({
                        beforeSubstr,
                        afterSubstr,
                    });
                } else {
                    tmp = tmp.slice(prevChunkLength);
                    prevChunkLength = chunk.length;
                }

                prevChunkLength = chunk.length;
            });

            rs.on("close", () => {
                resolve();
            });
        });
    }

    _readDir(path, options) {
        return readdir(path, options);
    }

    _setTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            this.emit('processing', {
                dir: this._dirProcessCount,
                files: this._fileProcessCount,
            });
        }, this._interval);
    }

    _isFileTypeMatched(ft, file) {
        const extWithoutDot = this._ext.replace(".", "");
        const currExt = extname(file.name);
        return (ft && ft.ext === extWithoutDot)
            ||
            (!ft && this._ext === currExt);
    }

    _isFileText(ft, ext) {
        const mime = ["plain/text", "text/rtf"];
        const extList = [".json", ".js", ".css", ".txt"];

        if(ft) {
            return mime.includes(ft.mime);
        } else {
            return extList.includes(ext);
        }
    }

    _checkFileType(element, elementPath) {        
        return new Promise((resolve, reject) => {
            const rs = createReadStream(elementPath, {
                highWaterMark: 4100,
            });

            rs.once("data", (chunk) => {
                FileType.fromBuffer(chunk).then((ft) => {
                    resolve({
                        isFileTypeMatched: this._isFileTypeMatched(ft, element),
                        ft,
                    });
                }).catch((e) => {
                    reject(e);
                });

                rs.destroy();
            });

            rs.on("close", error => {
                resolve({
                    isFileTypeMatched: this._isFileTypeMatched(null, element),
                    ft: null,
                });
            });
        });
    }
}

module.exports = Finder;