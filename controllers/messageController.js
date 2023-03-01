const MessageModel = require('../model/messageModel');

//Thêm tin nhắn vào database
module.exports.addMessage = async (req, res, next) => {
    try{
        const {from, to, message} = req.body;
        const data = await MessageModel.create({
            message: {text: message},
            users: [from, to],
            sender: from,
        });
        if(data) return res.json({msg: "Message sent successfully"});
        return res.json({msg: "failed to add message to the database"});
    } catch(e){
        next(e);
    }
};

//Lấy tất cả tin nhắn giữa 2 người
module.exports.getAllMessage = async (req, res, next) => {
    try {
        // Tìm tất cả tin nhắn có 2 người trong users
        const {from, to} = req.body;
        const message = await MessageModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({updateAt: 1});
        // Tạo mảng mới để lưu tin nhắn
        const projectMessages = message.map((msg)=> {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        res.json(projectMessages);
    } catch(e){
        next(e);
    }
};