require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- Test route ---
app.get('/', (req, res) => {
    res.send('UWC Bot backend is running!');
});

// --- Botpress + ElevenLabs route ---
app.post('/botpress', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).send('No message provided.');

    try {
        // Send user message to Botpress
        const botResponse = await axios.post(
            'https://your-botpress-server.com/api/v1/bots/your-bot-id/converse',
            { text: userMessage },
            { headers: { Authorization: `Bearer ${process.env.BOTPRESS_API_KEY}` } }
        );

        const botReply = botResponse.data; // Botpress text reply

        // Convert Botpress reply to speech
        const speechResponse = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
            { text: botReply },
            {
                responseType: 'arraybuffer',
                headers: {
                    'xi-api-key': process.env.ELEVEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Send both text and audio (Base64) to frontend
        res.json({
            text: botReply,
            audio: Buffer.from(speechResponse.data).toString('base64')
        });

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Error processing message');
    }
});

// --- ElevenLabs only route (optional) ---
app.post('/speak', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).send('No text provided.');

    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
            { text },
            {
                responseType: 'arraybuffer',
                headers: {
                    'xi-api-key': process.env.ELEVEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);

    } catch (err) {
        console.error('Error generating voice:', err);
        res.status(500).send('Error generating voice');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
