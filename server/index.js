import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"

dotenv.config()


const app = express()
app.use(cors({
  origin: "https://super-journey-x5w7rq54q4rjhv4rp-5173.app.github.dev",
  credentials: true,
}));
app.use(express.json())
app.use(cookieParser())


const PORT=process.env.PORT || 8000;
app.get("/test", (req, res) => {
  res.send("CORS working");
});

app.use("/api/auth", authRouter);  
app.use("/api/user", userRouter);
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
    connectDb();
})