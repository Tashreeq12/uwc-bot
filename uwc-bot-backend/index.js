const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Test route ---
app.get("/", (req, res) => {
  res.send("UWC Bot backend is running!");
});

// --- Botpress integration ---
app.post("/botpress", async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await axios.post(
      "https://your-botpress-server.com/api/v1/bots/your-bot-id/converse",
      { text: userMessage },
      { headers: { Authorization: `Bearer ${process.env.BOTPRESS_API_KEY}` } }
    );
    const botReply = response.data; // Botpress reply

    // --- Convert reply to speech ---
    const speechResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
      { text: botReply },
      {
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    // Send both text and audio
    res.json({
      text: botReply,
      audio: Buffer.from(speechResponse.data).toString("base64") // Base64 so frontend can play it
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error processing message" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
