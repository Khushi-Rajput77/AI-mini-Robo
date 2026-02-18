
const express = require('express')

const app = express();

app.get('/',(req,res)=>{

    res.send('Hello World!');

}) 

module.exports=app;


// openRouter key  for chatbot = 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