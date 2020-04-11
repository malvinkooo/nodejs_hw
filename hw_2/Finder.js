const EventEmitter = require('events');
const { readdir } = require('fs');
const { extname } = require('path');
const path = require("path");
const chalk = require("chalk");
const { isExtMatched } = require('./functions/functions.js');

class Finder extends EventEmitter {
    constructor(currPath, extList, deep, search) {
        super();

        this._path = currPath;
        this._extList = extList;
        this._deep = deep;
        this._search = search;
        this._dirProcessCount = 0;
        this._fileProcessCount = 0;

        this._interval = 2000;
        this._timer;
        
        this.on('file', this._setTimer);

        setTimeout(() => {
            this.emit('started');
        }, 0);
    }

    async parse() {
        this._setTimer();
        this._deep = (this._deep === 0) ? -1 : this._deep;

        const result = await this._parseDir(this._path, this._deep);

        this.emit('finished', result);
        clearTimeout(this._timer);
    }

    async _parseDir(currPath, deep) {
        let result = [];
        let items;

        if (deep === 0) {
            return result;
        }

        try {
            items = await this._readDir(currPath, {
                withFileTypes: true
            });
        } catch (err) {
            console.error(chalk.red(err));
            process.exit(1);
            return false;
        }

        for (let element of items) {
            const elementPath = path.join(currPath, element.name);

            if (element.isDirectory()) {
                this._dirProcessCount++;
                const res = await this._parseDir(elementPath, deep - 1)
                result.push(...res);
            } else if (element.isFile()) {
                this._fileProcessCount++;

                if(isExtMatched(this._extList, extname(element.name))) {
                    if(element.name.indexOf(this._search) != -1) {
                        
                        result.push(elementPath);
                        this.emit('file', elementPath);
                    }
                }
            }
        }

        return result;
    }

    _readDir(path, options) {
        return new Promise((resolve, reject) => {
            readdir(path, options, (err, res) => {
                if (err) {
                    return reject(`Error reading the directory: ${path}`);
                }

                resolve(res);
            });
        });
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
}

module.exports = Finder;