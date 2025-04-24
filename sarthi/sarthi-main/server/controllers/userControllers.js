const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

// Initialize Gemini AI with the correct model name and trim the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Helper function to get Gemini response
async function getGeminiResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    throw error;
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    pic,
    password,
  });
  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error("Failed to create the user!!");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
  // Check Password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error("Invalid Credentials");
  }
  const token = user.createJWT();
  console.log("token", user);
  res.cookie("token", token, {
    expires: new Date(Date.now() + 604800000),
  });
  return res.status(200).json({
    ...user._doc,
    createdAt: user._id.getTimestamp(),
    password: undefined,
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json(user);
  }
  return res.status(200).json(null);
});

const handleLogout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

const handleGetRoadmap = asyncHandler(async (req, res) => {
  console.log(req.user);
  try {
    // Assuming you're identifying the user somehow, such as through a JWT token
    const userId = req.user._id; // Replace with actual user identifier

    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the user exists and has a roadmap
    if (user && user.roadmap && user.roadmap.length > 0) {
      // If user has a roadmap, send it in the response
      return res.status(200).json({ roadmap: user.roadmap });
    } else {
      // If user does not have a roadmap, send a message indicating so
      return res.status(200).json({ roadmap: [] });
    }
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching roadmap:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const handleGetUserData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(200).json({ user: null });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const handleReportUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const { counsellorType } = req.params;
  const { email } = req.user;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `pdfs/${Date.now()}_${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: "application/pdf",
  };

  try {
    const data = await s3.upload(params).promise();

    // Add the new report to the user's reportHistory
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $push: {
          reportHistory: {
            title: `${counsellorType} Session Report`, // Customize the title as needed
            filePath: data.Location,
          },
        },
      },
      { new: true, upsert: true } // Upsert true to ensure the document is created if it does not exist
    );
    console.log("updatedUser ", updatedUser);
    res.status(200).send({
      message: "PDF uploaded and saved to report history successfully",
      url: data.Location,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error uploading to S3 or updating user:", err);
    res.status(500).send(err.message);
  }
});

const handleGetAllReports = asyncHandler(async (req, res) => {
  const { email } = req.user;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json(user.reportHistory);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const handleGetSkills = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  const getroadmap = user.roadmap;
  const goals = getroadmap.map((item) => item.Goal);
  console.log("goals: ", goals);

  try {
    const prompt = `Given these goals -> ${goals}, go through these goals and split them into two categories: one should have non-technical skills that the goals aim to provide, and the second category should contain strictly technical skill names that these goals aim to provide. Make sure to only add technical skill topic names strictly and in minimal words. If there are no technical skills, send an empty array. The desired skill topic should reflect the main thing that goals are trying to achieve, and that technical skill name should be relevant in the realm of development only. Return the result in the following format:
    [{
      "skill": "name of the skill",
      "type": "technical OR nontechnical"
    }]`;
    
    const response = await getGeminiResponse(prompt);
    let skill = JSON.parse(response);
    
    const user = await User.findOne({ email });
    skill.forEach((element) => {
      user.skills.push(element);
    });
    user.roadmap = [];
    await user.save();
    res.cookie("token", user.createJWT(), {
      expires: new Date(Date.now() + 604800000),
    });
    res.json(user);
  } catch (error) {
    console.log("error happened while saving skills", error);
    res.json("Error while saving User skills!!!");
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  handleLogout,
  handleGetRoadmap,
  handleGetUserData,
  handleReportUpload,
  handleGetAllReports,
  handleGetSkills,
};