const http = require('http');
const { createReadStream, readFile, promises } = require('fs');
const { join, extname } = require('path');
const fileType = require("file-type");
const { 
    getMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    addMessage } = require("./controllers");
const { logResponse, logRequestCount } = require("./functions.js");

const MESSAGES_PATH_REGEXP = new RegExp('^/messages', 'i');
const reqCount = {};

setInterval(() => {
    logRequestCount(reqCount);
}, 1000 * 60);

const server = http.createServer(async (req, res) => {
    const { method, headers } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname, searchParams, search } = url;
    const full_path = join(__dirname, "assets", pathname);

    if(reqCount[res.statusCode]) {
        reqCount[res.statusCode][headers["user-agent"]] = reqCount[res.statusCode][headers["user-agent"]] ? reqCount[res.statusCode][headers["user-agent"]] + 1 : 1;
    } else {
        reqCount[res.statusCode] = {
            [headers["user-agent"]]: 1,
        };
    }

    const startTime = new Date();
    let finished = false;
    const finishListener = () => {
        finished = true;
        const endTime = new Date();
        logResponse(startTime, endTime, headers['user-agent'], url.href, res.statusCode);
    };
    res.once("finish", finishListener);
    res.once("close", () => {
        res.removeListener("finish", finishListener);

        if(!finished) {
            finishListener();
        }
    });

    try {
        const stat = await promises.stat(full_path);
        if(stat.isFile()) {
            const rs = createReadStream(join(full_path));
            rs.once("readable", async () => {
                const chunk = rs.read(stat.size > 4100 ? 4100 : stat.size);
                const ft = await fileType.fromBuffer(chunk);

                res.setHeader("content-type", ft ? ft.mime : `text/${extname(full_path).replace(".", "")}`);
                res.write(chunk);
                rs.pipe(res);
            });

            return;
        }
    } catch(e) {
        if(e.code !== "ENOENT") {
            res.statusCode = 400;
            res.end(JSON.stringify({error: e}));
        }
    }

    if(pathname === '/') {
        res.statusCode = 302;
        res.setHeader("Location", "/index.html");
        res.end();
    } else if(MESSAGES_PATH_REGEXP.test(pathname)) {
        const route = pathname[pathname.length - 1] === "/" ? pathname.slice(0, pathname.length - 1) : pathname;
        const url_params = route.split("/");
        const message_id = url_params[2];

        if (method === "GET") {
            if(url_params.length === 2) {
                getMessages(req, res, searchParams);
            } else {
                getMessageById(message_id, req, res);
            }
        } else if(method === "POST") {
            addMessage(req, res);
        } else if(method === "PUT" && url_params.length === 3) {
            updateMessage(Number.parseInt(message_id), req, res);
        } else if (method === "DELETE" && url_params.length === 3) {
            deleteMessage(Number.parseInt(message_id), req, res);
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({message: "not found"}));
    }
});

server.listen(3000, '127.0.0.1', () => {
    const address = server.address();
    console.log(`Web server started: ${address.port}`);
});