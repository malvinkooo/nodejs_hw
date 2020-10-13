const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    text: {
        type: String
    },
}, {
    collection: "messages",
});

module.exports = mongoose.model("MessageSchema", messageSchema);