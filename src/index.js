import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import cors from "cors"


import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"
import {app,server} from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors({
  origin:"https://chat-app-frontend-tnsf.vercel.app",
  credentials:true,
}
))
app.use(cookieParser())
app.use(express.json())
app.use("/api/auth" , authRoutes)
app.use("/api/messages" , messageRoutes)

app.get("/", (req, res) => {
  res.send("Server is running...");
});



server.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running", PORT);
  connectDB()
});
