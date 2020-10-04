const express = require("express");
const router = express.Router();
const controller = require("./controller.js");
const { paramsGetById, updateMessageValidation } = require("./validation.js");

router.get("/messages", controller.getMessages);
router.get("/messages/:id", paramsGetById, controller.getMessageById);
router.post("/messages", controller.addMessage);
router.put("/messages/:id", paramsGetById, updateMessageValidation, controller.updateMessage);
router.delete("/messages/:id", paramsGetById, controller.deleteMessage);

module.exports = router;