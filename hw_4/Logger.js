const { createWriteStream } = require("fs");

class Logger {
    constructor() {
        this.reqCount = {};
    }

    increaseReqCount(request, response) {
        const { statusCode } = response;
        const userAgent = request.headers["user-agent"];

        if(this.reqCount[statusCode]) {
            this.reqCount[statusCode][userAgent] = this.reqCount[statusCode][userAgent] ? this.reqCount[statusCode][userAgent] + 1 : 1;
        } else {
            this.reqCount[statusCode] = {
                [userAgent]: 1,
            };
        }
    }

    logRequestCount() {
        const ws = createWriteStream("./log/requests.txt");
        ws.write(JSON.stringify(this.reqCount));
        ws.end();
    }

    logResponse(reqTimeTracker, request, response, url) {
        reqTimeTracker.stop();
        const ws = createWriteStream("./log/files.txt", { flags:'a'});

        ws.write(`URL: ${url.href},\r\n Start time: ${reqTimeTracker.getStartTime()},\r\n End time: ${reqTimeTracker.getEndTime()},\r\n Time spend: ${reqTimeTracker.getSpendTime()}s,\r\n Status: ${response.statusCode}\r\n,\r\n User agent: ${request.headers['user-agent']}`);

        ws.end();
    }
}

exports.logger = new Logger();