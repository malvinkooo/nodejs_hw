exports.getMessages = (req, res, next) => {
    let { sort, sortValue, limit, skip } = req.query;
    let messages = [...res.app.locals.messages];

    switch (sort) {
        case "text":
            messages.sort((a, b) => {
                if (a.text > b.text) return 1;
                if (a.text < b.text) return -1;
                if (a.text === b.text) return 0;
            });
            break;

        case "id":
            messages.sort((a, b) => a.id - b.id);
            break;

        case "date":
            messages.sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                if (a.date === b.date) return 0;
            });
            break;

        default:
            messages.sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                if (a.date === b.date) return 0;
            });
    }

    switch(sortValue) {
        case "asc":
            //восходящий
            break;
        
        default:
            messages.reverse();
            break;
    }

    limit = !Number.isNaN(Number.parseInt(limit)) ? Number.parseInt(limit) : 10;
    messages = messages.slice(0, limit);

    if(!Number.isNaN(Number.parseInt(skip))) {
        messages = messages.slice(Number.parseInt(skip), messages.length);
    }

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
