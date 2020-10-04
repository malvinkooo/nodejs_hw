exports.getMessages = (req, res, next) => {
    let { sort = "date", sortValue = "asc", limit = 10, skip = 0 } = req.query;
    let messages = [...res.app.locals.messages];

    const dateCmp = (a,b) => new Date(a) - new Date(b);
    const intCmp = (a,b) => a - b;
    const stringCmp = (a,b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        if (a === b) return 0;
    };

    const fieldToCmpFunction = {
        "text": stringCmp,
        "date": dateCmp,
        "id": intCmp
    };

    const cmpFunc = fieldToCmpFunction[sort];
    if (cmpFunc) {
        messages.sort((a, b) => cmpFunc(a[sort], b[sort]));
    }


    if(sortValue !== "asc") {
        messages.reverse();
    }

    if(limit === "all") {
        limit = messages.length;
    }

    messages = messages.slice(skip, limit + skip);

    res.send(messages);
}

exports.getMessageById = (req, res) => {
    const { messages } = res.app.locals;
    const { id } = req.params;

    const message = messages.find(message => message.id === id);
    res.send(message);
}

exports.addMessage = (req, res) => {
    const { messages } = res.app.locals;
    const { text } = req.body;

    const message = {
        id: messages.length + 1,
        text,
        date: new Date(),
    };

    messages.push(message);

    res.send(message);
}

exports.updateMessage = (req, res, next) => {
    const { messages } = res.app.locals;
    const { text } = req.body;
    const { id } = req.params;

    const message = messages.find(message => message.id === id);
    if(!message) {
        return next({code: 404, message: "Message not found."});
    }

    Object.assign(message, {
        text,
        update: new Date(),
    });

    res.send(message);
}

exports.deleteMessage = (req, res, next) => {
    const { messages } = res.app.locals;
    const { id } = req.params;

    const messageId = messages.findIndex(message => message.id === id);
    if(!messageId <= 0) {
        return next({code: 404, message: "Message not found."});
    }

    const message = messages[messageId];
    messages.splice(messageId, 1);

    res.send(message);
}
