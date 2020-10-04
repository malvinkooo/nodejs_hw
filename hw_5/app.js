const express = require("express");
const { join } = require("path");
const message_module = require("./messages");
const { logger } = require("./Logger.js");
const { RequestTimeTracker } = require("./RequestTimeTracker.js");

const server = express();

setInterval(() => {
    logger.logRequestCount();
}, 1000 * 60);

server.use(function (req, res, next) {
    const reqTimeTracker = new RequestTimeTracker();

    res.on("finish", () => {
        reqTimeTracker.stop();
        logger.increaseReqCount(req, res);
        logger.logResponse(reqTimeTracker, req, res);
    });
    next();
});

server.use(express.static(join(__dirname, "assets")));

server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.locals.messages = [{
    "id": 1,
    "text": "aaaa",
    "date": "2020-09-24T18:07:01.813Z"
},
{
    "id": 2,
    "text": "bbbb",
    "date": "2020-09-24T18:09:01.813Z"
},
{
    "id": 3,
    "text": "aaaa",
    "date": "2020-09-24T18:15:01.813Z"
}];

server.get("/", (req, res) => {
    res.statusCode = 302;
    res.setHeader("Location", "/index.html");
    res.end();
});

server.use(message_module);

server.use(function(err, req, res, next) {
    res.status(err.code || 400).send({message: err.message || err});
});

server.listen(3000, "localhost", () => {
    console.log("Server started on port 3000");
});