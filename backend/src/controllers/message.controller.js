import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUserForsidebar = async (req, res) => {
  try {
    // Ensure that req.user is populated correctly and loggedInUser is defined
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const loggedInUser = req.user._id;

    // Log the logged-in user ID to check if it's correct
    console.log("Logged-in user ID:", loggedInUser);

    // Fetch users excluding the logged-in user
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password"); // Exclude the password field from the response

    // Check if users are found
    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Log the filtered users to check the data
    console.log("Filtered Users:", filteredUsers);

    // Respond with the filtered users
    res.status(200).json(filteredUsers);
  } catch (error) {
    // Enhanced error handling and logging
    console.error("Error in getUserForsidebar:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Fetch messages between the logged-in user and the selected user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Check if messages are found
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    // Respond with the messages
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageurl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageurl = uploadResponse.url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageurl,
    });

    await newMessage.save();

    // todo: Realtime functionality goes here (socket.io or similar)

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
