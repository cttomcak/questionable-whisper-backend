// Requirements
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const { Readable } = require("stream");
const axios = require("axios");

// Grabs API key as OPENAI_API_KEY
require('dotenv').config();

const app = express();
const upload = multer();

// Link to Whisper API
const apiLink = "https://api.openai.com/v1/audio/transcriptions"

app.use(cors()); // "cross-origin resource sharing", idk how it works
app.use(express.json());

// Port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// For audio file
const bufferToStream = (buffer) => {
  return Readable.from(buffer);
};

app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }
    const formData = new FormData();
    const audioStream = bufferToStream(audioFile.buffer);
    formData.append("file", audioStream, {
      filename: "audio.mp3",
      contentType: audioFile.mimetype,
    });
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");
    const config = {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    };
    const response = await axios.post(
      apiLink,
      formData,
      config
    );
    const transcription = response.data.text;
    res.json({ transcription });
  } catch (error) {
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});
