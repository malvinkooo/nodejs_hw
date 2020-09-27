const qs = require("querystring");
const { createReadStream, createWriteStream } = require("fs");

let messages;

const rs = createReadStream("./messages.txt");
let data = "";
rs.on("data", chunk => {
    data += chunk;
});
rs.on("end", () => {
    messages = JSON.parse(data);
});

const allowed_content_types = [
    "application/x-www-form-urlencoded",
    "application/json"
];

exports.getMessages = (req, res, searchParams) => {
    const sort = searchParams.get("sort");
    const skip = Number.parseInt(searchParams.get("skip"));
    const limit = Number.parseInt(searchParams.get("limit"));
    let result = messages;

    if(sort === "desc") {
        result = [];
        for(let i = messages.length - 1; i >= 0; i--) {
            result.push(messages[i]);
        }
    }

    if(skip && skip !== null) {
        result = result.slice(skip, result.length);
    }

    if(limit && limit !== null && !Number.isNaN(limit)) {
        result = result.slice(0, limit);
    } else if(limit === "all") {
        result = result;
    }

    res.end(JSON.stringify(result));
}

exports.getMessageById = (id, req, res) => {
    const message = messages.find(itm => itm.id === Number.parseInt(id));
    if(message) {
        res.end(JSON.stringify(message));
    } else {
        res.statusCode = 404;
        res.end("Not found");
    }
}

exports.addMessage = (req, res) => {
    const content_type = req.headers["content-type"];

    if(!allowed_content_types.includes(content_type)) {
        res.statusCode = 400;
        res.end(JSON.stringify({message: "Not allowed content type."}));
        return;
    }

    let body = "";
    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
        let data;

        if(content_type === "application/json") {
            data = JSON.parse(body);
        } else if(content_type === "application/x-www-form-urlencoded") {
            data = qs.parse(body);
        }

        const message = {
            id: messages.length + 1,
            text: data.text,
            createAt: new Date(),
        };
        messages.push(message);
        res.end(JSON.stringify(message));

        const ws = createWriteStream("./messages.txt");
        ws.write(JSON.stringify(messages));
        ws.end();
    });
}

exports.updateMessage = (id, req, res) => {
    const content_type = req.headers["content-type"];

    if(!allowed_content_types.includes(content_type)) {
        res.statusCode = 400;
        res.end(JSON.stringify({message: "Not allowed content type."}));
        return;
    }

    let body = "";
    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
        let data;
        let message = null;

        if(content_type === "application/json") {
            data = JSON.parse(body);
        } else if(content_type === "application/x-www-form-urlencoded") {
            data = qs.parse(body);
        }

        messages.forEach((itm) => {
            if(id === itm.id) {
                itm.text = data.text;
                message = itm;
                return;
            }
        });

        res.end(JSON.stringify(message));

        const ws = createWriteStream("./messages.txt");
        ws.write(JSON.stringify(messages));
        ws.end();
    });
}

exports.deleteMessage = (id, req, res) => {
    messages = messages.filter(itm => {
        return id != itm.id;
    });

    res.end(JSON.stringify({"id": id}));

    const ws = createWriteStream("./messages.txt");
    ws.write(JSON.stringify(messages));
    ws.end();
}