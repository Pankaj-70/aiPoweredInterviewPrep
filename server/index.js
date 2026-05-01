import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"

const app = express()
dotenv.config()

const PORT=process.env.PORT 


app.get('/', (req, res)=>{
    res.send('hey there')
})

app.listen(PORT, ()=>{
    console.log("Server running on port 8000");
    connectDb();
})