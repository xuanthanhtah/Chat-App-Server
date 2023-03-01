const user = require('../model/userModel');
const bcrypt = require('bcrypt');

// Đăng ký tài khoản
module.exports.register = async (req, res, next) => {
    try {
        const {userName, email, password} = req.body;

        //kiểm tra username đã tồn tại chưa
        const usernameCheck = await user.findOne({userName });
        if(usernameCheck) 
            return res.json({msg: "Username already exists", status: false});
            
        //Kiểm tra email đã tồn tại chưa
        const emailCheck = await user.findOne({email});
        if(emailCheck) {
            return res.json({msg: "Email already exists", status: false});
        }
        
        //mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await user.create({
            email,
            userName,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({status: true, newUser });
    } catch (error) {
        next(error);
    }
};

// Đăng nhập
module.exports.login = async (req, res, next) => {
    try {
        const {userName, password} = req.body;
        //kiểm tra username có tồn tại không
        const newsUser = await user.findOne({userName});
        if(!newsUser) {
            return res.json({msg: "Username does not exist", status: false});
        }
        //kiểm tra password có đúng không
        const isMatch = await bcrypt.compare(password, newsUser.password);
        if(!isMatch) {
            return res.json({msg: "Password is incorrect", status: false});
        }
        //xóa password trước khi trả về
        delete newsUser.password;
        return res.json({status: true, newsUser});
    } catch (error) {
        next(error);
    }
};

//Gán avatar cho user
module.exports.setAvatar = async (req, res, next) => {
    try {
        const usersId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await user.findByIdAndUpdate(usersId, {
            isAvatarImageSet: true,
            avatarImage,
        });
        return res.json({
            isSet: userData.isAvatarImageSet, 
            image: userData.avatarImage,
        })
    } catch (error) {
        next(error);
    }
};

//Lấy tất cả user trừ user hiện tại
module.exports.getAllUsers = async (req, res, next) => {
    try {
        // lấy tất cả user trừ user hiện tại
        const users = await user.find({_id:{ $ne: req.params._id }}).select([
            "email", "userName",  "avatarImage", "_id",
        ]); 
        return res.json({users});
    } catch (error) {
        next(error);
    }
}
