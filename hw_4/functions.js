const { createWriteStream } = require("fs");

exports.logResponse = (startTime, endTime, userAgent, href, statusCode) => {
    const ws = createWriteStream("./log/files.txt", { flags:'a'});

    ws.write(`URL: ${href},\r\n Start time: ${startTime},\r\n End time: ${endTime},\r\n Time spend: ${((endTime - startTime) / 1000).toFixed(3)}s,\r\n Status: ${statusCode}\r\n`);

    ws.end();
};

exports.logRequestCount = (reqCount) => {
    const ws = createWriteStream("./log/requests.txt");
    ws.write(JSON.stringify(reqCount));
    ws.end();
}