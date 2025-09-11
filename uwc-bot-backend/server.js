require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow requests from your frontend
app.use(bodyParser.json());

const PORT = 3000;

// ElevenLabs TTS endpoint
app.post('/speak', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).send('No text provided.');

    try {
        const response = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/agent_4901k4vz4k5yfy0v797epsccrky5', // Your Voice ID
            { text },
            {
                responseType: 'arraybuffer',
                headers: {
                    'xi-api-key': process.env.ELEVEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Send audio directly to frontend
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);

    } catch (err) {
        console.error('Error generating voice:', err);
        res.status(500).send('Error generating voice');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
