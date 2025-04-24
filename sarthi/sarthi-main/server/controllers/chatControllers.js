const asyncHandler = require("express-async-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Initialize Gemini AI with the correct model name and trim the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

let messages = [];
function updateChat(messages, role, content) {
  messages.push({ role, content });
  return messages;
}

// Helper function to convert OpenAI message format to Gemini format
function convertToGeminiHistory(messages) {
  const history = [];
  
  // Skip system messages as Gemini doesn't have system role
  // Instead, we'll prepend system instructions to the first message
  let systemInstructions = "";
  
  // Extract system messages
  messages.forEach(msg => {
    if (msg.role === "system") {
      systemInstructions += msg.content + " ";
    }
  });
  
  // Convert user/assistant messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      // For the first user message, prepend system instructions
      if (history.length === 0 && systemInstructions) {
        history.push({
          role: "user",
          parts: [{ text: systemInstructions + "\n\n" + msg.content }]
        });
      } else {
        history.push({
          role: "user",
          parts: [{ text: msg.content }]
        });
      }
    } else if (msg.role === "assistant") {
      // Convert "assistant" role to "model" for Gemini API
      history.push({
        role: "model", // Changed from "assistant" to "model"
        parts: [{ text: msg.content }]
      });
    }
  }
  
  return history;
}

async function getGeminiResponse(messages) {
  try {
    // Convert messages to Gemini format
    const geminiHistory = convertToGeminiHistory(messages);
    
    // Get the model with updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // If we have a chat history
    if (geminiHistory.length > 1) {
      const chat = model.startChat({
        history: geminiHistory.slice(0, -1),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      
      // Send the last message to get a response
      const lastMessage = geminiHistory[geminiHistory.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      return result.response.text();
    } 
    // For the first message
    else if (geminiHistory.length === 1) {
      const result = await model.generateContent(geminiHistory[0].parts[0].text);
      return result.response.text();
    }
    // Fallback if no messages
    else {
      throw new Error("No messages to process");
    }
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    throw error;
  }
}

const getChat = asyncHandler(async (req, res) => {
  const counselorType = req.params.counselorType;
  try {
    messages = [
      {
        role: "system",
        content: `You are a helpful AI counsellor. Please ask me the most relevant questions related to counseling. Ask questions one by one followed by response by the user then continue. Strictly reply outside the scope if anything is asked outside the counselling domain.`,
      },
      { role: "system", content: "Ask me questions one by one." },
      {
        role: "system",
        content: `I want you to act as a ${counselorType}.`,
      },
    ];
    const user = await User.findById(req.user._id);
    user.sessionHistory.push({ date: new Date(), status: "started" });
    await user.save();
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getting chat", err);
    res.status(500).send("Internal Server Error");
  }
});

const handleSendChat = asyncHandler(async (req, res) => {
  try {
    const userMessage = req.body.messages.slice(-1)[0];
    messages = updateChat(messages, "user", userMessage.content);

    const modelResponse = await getGeminiResponse(messages);
    messages = updateChat(messages, "assistant", modelResponse);
    console.log(messages);
    res.status(200).json(modelResponse);
  } catch (err) {
    console.error("Error processing chat request", err);
    res.status(500).send("Internal Server Error");
  }
});

const handleCreateReport = asyncHandler(async (req, res) => {
  const { chat, userName, counsellorType } = req.body;
  console.log(chat);
  if (!chat || chat.length == 0) {
    res.status(400);
    throw new Error("Failed to create the report!!");
  }
  try {
    const reportPrompt = [
      ...chat,
      {
        role: "system",
        content: `I am ${userName} I want you to create a report from the above chat conversation for the user. compile a formal report with proper space and headings, including SWOT analysis, roadmap, tips, recommendation with proper roadmap, videos, books, blogs,news anything and tricks to help user. To help user to understand more about him/her.`,
      },
    ];
    const report = await getGeminiResponse(reportPrompt);
    console.log("req.user: ", req.user);
    const user = await User.findById(req.user._id);

    user.reportHistory.push({
      date: new Date(),
      title: `${counsellorType} Session Report`,
    });
    await user.save();

    return res.status(200).json(report);
  } catch (error) {
    res.status(500);
    throw new Error("Internal Server Error", error);
  }
});

const handleCreateRoadmap = asyncHandler(async (req, res) => {
  try {
    roadmapPrompt = [
      ...messages,
      {
        role: "system",
        content: `Pretend you are an expert helpful AI career counsellor.`,
      },
      {
        role: "system",
        content: ` Create a precise list of all the specific goals associated with a definitive timeline such that the output gives us a detailed step by step reccomendation of that goals and recommendations.
          should contains all goals from the roadmap for days wise days tasks based on the user goal.
          Keep in mind to not include any explanations with specific entries and follow this format without any deviation. Also dont include a weekly based planner in the timeline. make sure to use a day-wise planner.
          dont give any explanation just provide the roadmap in the following format.
          [{
            "Goal": "goal to be done",
            "timeline": "timeline based on that goal",
            "recommendations": [{
              "title": "title of the recommendation course",
              "link" : "link of the recommended course"
            }],
            "isCompleted":false
          }]`,
      },
    ];
    
    const roadmapResponse = await getGeminiResponse(roadmapPrompt);
    console.log("Raw roadmap response:", roadmapResponse);
    
    // Clean the response - sometimes AI responses have extra text before/after JSON
    let jsonStart = roadmapResponse.indexOf('[');
    let jsonEnd = roadmapResponse.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      return res.status(500).json({
        error: "Invalid response format",
        message: "Could not find valid JSON in the response"
      });
    }
    
    const cleanedResponse = roadmapResponse.substring(jsonStart, jsonEnd);
    
    // Parse the JSON response
    let roadmapData;
    try {
      roadmapData = JSON.parse(cleanedResponse);
      console.log("Parsed roadmap data:", roadmapData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.status(500).json({
        error: "Failed to parse roadmap data",
        message: parseError.message,
        rawResponse: cleanedResponse
      });
    }
    
    // Validate roadmap data is an array
    if (!Array.isArray(roadmapData)) {
      return res.status(500).json({
        error: "Invalid roadmap format",
        message: "Roadmap must be an array"
      });
    }
    
    // Update user record with await
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: { roadmap: roadmapData } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("User roadmap updated successfully");
    
    // Skip email sending if environment variables are missing
    if (process.env.Email && process.env.PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.Email,
            pass: process.env.PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        
        const mailOptions = {
          from: process.env.USERNAME || "Mind Guide",
          to: req.user.email,
          subject: "Mind Guide Session Report",
          html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your Roadmap Is Ready</title>
            </head>
            <body>
              <h1>Your Mind Guide Roadmap</h1>
              <p>Your personalized roadmap has been created.</p>
              <p>Please check your dashboard to see your roadmap.</p>
            </body>
          </html>
          `
        };
        
        // Send email without waiting for it to complete
        transporter.sendMail(mailOptions).catch(err => {
          console.error("Email sending error:", err);
        });
      } catch (emailError) {
        console.error("Email setup error:", emailError);
      }
    } else {
      console.log("Email not sent - missing configuration");
    }
    
    // Return the roadmap data to the client
    return res.status(200).json({
      success: true,
      roadmap: roadmapData
    });
    
  } catch (err) {
    console.error("Error creating roadmap:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
});

const handleTaskUpdate = asyncHandler(async (req, res) => {
  const { roadmap } = req.body;
  User.findOneAndUpdate(
    { email: req.user.email },
    { $set: { roadmap } },
    { new: true }
  )
    .then((updatedUser) => {
      if (updatedUser) {
        console.log("User roadmap updated successfully.");
        // Send report via email
      } else {
        console.log("User not found.");
      }
    })
    .catch((error) => {
      console.error("Error updating user roadmap:", error);
    });
});

const handleRoadmapUpdation = asyncHandler(async (req, res) => {
  console.log(messages);

  const { roadmap } = req.body;
  let updatedRoadmapPrompt = [];
  try {
    updatedRoadmapPrompt = [
      ...messages,
      {
        role: "system",
        content: `Pretend you are an expert helpful AI career counsellor.`,
      },
      {
        role: "user",
        content: ` i am providing a roadmap document which i have completed ${roadmap} containing all details of goals and recommendation,timeline and iscompleted. now i want you to provide me a new updated roadmap with next goal thing to do in reference with the current goals. Continue the time for the task with reference to the given roadmap -Do not include any explanations following this format without deviation.
          [{
            "Goal": "goal to be done",
            "timeline": "timeline based on that goal",
            "recommendations": [{
              "title": "title of the recommendation course",
              "link" : "link of the recommended course"
            }],
            "isCompleted":false(boolean)
          }].`,
      },
    ];
    
    const updatedRoadmapResponse = await getGeminiResponse(updatedRoadmapPrompt);
    console.log("HandleUpdateRoadmap ", updatedRoadmapResponse);
    return res.send(updatedRoadmapResponse);
  } catch (err) {
    console.error("Error Happened ", err);
    res.status(500).send("Internal Server Error ");
  }
});

module.exports = {
  getChat,
  handleSendChat,
  handleCreateReport,
  handleCreateRoadmap,
  handleRoadmapUpdation,
  handleTaskUpdate,
};