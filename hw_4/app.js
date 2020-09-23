const http = require('http');
const { createReadStream, promises } = require('fs');
const { join, extname } = require('path');
const fileType = require("file-type");
const { 
    getMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    addMessage } = require("./controllers");
const { RequestTimeTracker } = require("./RequestTimeTracker.js");
const { logger } = require("./Logger.js");

const MESSAGES_PATH_REGEXP = new RegExp('^/messages', 'i');

setInterval(() => {
    logger.logRequestCount();
}, 1000 * 60);

const server = http.createServer(async (req, res) => {
    const { method, headers } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname, searchParams } = url;
    const full_path = join(__dirname, "assets", pathname);
    let finished = false;
    const reqTimeTracker = new RequestTimeTracker();

    const finishListener = () => {
        finished = true;
        logger.logResponse(reqTimeTracker, req, res, url);
        logger.increaseReqCount(req, res);
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

        switch(method) {
            case "GET":
                if(url_params.length === 2) {
                    getMessages(req, res, searchParams);
                } else {
                    getMessageById(message_id, req, res);
                }
                break;
            
            case "POST":
                addMessage(req, res);
                break;

            case "PUT":
                if(url_params.length === 3) {
                    updateMessage(Number.parseInt(message_id), req, res);
                }
                break;

            case "DELETE":
                if(url_params.length === 3) {
                    deleteMessage(Number.parseInt(message_id), req, res);
                }
                break;

            default:
                res.statusCode = 400;
                res.end(JSON.stringify({message: "Bad request"}));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({message: "Not found"}));
    }
});

server.listen(3000, () => {
    const address = server.address();
    console.log(`Web server started: ${address.port}`);
});