const MessageModel = require("../models/message.model.js");

exports.getMain = async (req, res) => {
    let { sort = "date", sortValue = "desc", limit = 10, skip = 0 } = req.query;
    if(limit === "all") limit = 100;
    
    const messages = await MessageModel.find({})
        .limit(Number.parseInt(limit))
        .skip(Number.parseInt(skip))
        .sort({ [sort]: sortValue });

    const obj = {
        title: "Сообщения",
        messages,
    };

    res.render("index.nunjucks", obj);
}

exports.createMessage = async (req, res) => {
    const message = new MessageModel(req.body);
    message.date = new Date();

    await message.save();
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
}

exports.updateMessage = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const result = await MessageModel.findByIdAndUpdate(
        id,
        {text,},
        {new: true,});

    res.json(result);
}

exports.deleteMessage = async (req, res) => {
    const { id } = req.params;
    await MessageModel.findByIdAndDelete(id);
    res.json(id);
}