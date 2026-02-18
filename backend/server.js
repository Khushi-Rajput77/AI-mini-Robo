require("dotenv").config();
const app =require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");

const generateResponse= require('./src/services/ai-service');

const httpServer = createServer(app);
const io = new Server(httpServer, {cors:{
    origin:"http://localhost:5173",
} });

// this for short memory//
const chatHistory = []
////////////////////////////

io.on("connection", (socket) => {
 console.log("A user connected");

 socket.on("disconnect",()=>{
  console.log("A user disconnected");
 });

 socket.on("mama",(dataa)=>{
  console.log(dataa)
 });

 socket.on("Message",()=>{
  console.log("Message Received");
 })
//for json format data.prompt
//  socket.on("ai-message", async(data)=>{
//     console.log("Received AI message:", data.prompt);
//     const response =await generateResponse(data.prompt);

//     console.log("AI Response:", response);
//     socket.emit("ai-message-response",{response})
//  })
/////////////////////////////////

//for text format only data
  socket.on("ai-messages", async(data)=>{
    console.log("Received AI message:", data);

    //This for short memory //
    chatHistory.push({
        role:"user",
       content:data
    })

    ////////////////////////////////////
    const mama =await generateResponse(chatHistory);

     chatHistory.push({
    role: "assistant",
    content: mama
});


    console.log("AI Response:", mama);
    socket.emit("ai-message-response",{mama})
 })
 //////////////////////////////////
});


httpServer.listen(3000,()=>{
    console.log('Server is running on port 3000')
})