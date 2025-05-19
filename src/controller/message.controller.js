import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    // console.log("REQ: ", req);
    // console.log("REQ.PARAMS: ",req.params);

    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUSersForSidebar", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    // console.log("REQ.USER:", req.user._id, "Type:", typeof req.user._id);
    // console.log("REQ.PARAMS:", req.params);

    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    
    // ✅ Convert `userToChatId` to ObjectId if valid
    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      const userToChatObjectId = new mongoose.Types.ObjectId(userToChatId);
  

    // ✅ Query using correct ObjectIds
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatObjectId },
        { senderId: userToChatObjectId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage" , newMessage);
    }


    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
