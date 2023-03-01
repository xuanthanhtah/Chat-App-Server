const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const messageRouter = require('./routes/messageRoutes');
const app = express();
const socket = require('socket.io');

require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRouter);

mongoose.set("strictQuery", false);
//Kết nối database mongodb
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    })
    .then(()=> {
        console.log('MongoDB connection successful');
     })
     .catch((err)=> {
        console.log(err);
     });

// Kết nối server với port 5000
const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port: ${process.env.PORT}`);
});

//socket setup
const io = socket(server, { 
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    }
});


global.onlineUsers = new Map();

//Khi có người kết nối đến server thì sẽ gọi hàm callback và trả về socket của người đó 
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId)=>{
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data)=> {
        const senUserSocket = onlineUsers.get(data.to);
        if(senUserSocket) {
            socket.to(senUserSocket).emit("msg-receive", data.message);
        }
    })
})
