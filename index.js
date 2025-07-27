// ff-like-api/index.js

const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// UID limiter system (simple memory based)
const usedUIDs = new Map();

const dailyLimit = 1;

function hasUsed(uid) {
  const today = new Date().toISOString().split("T")[0];
  if (!usedUIDs.has(uid)) {
    usedUIDs.set(uid, { date: today, count: 0 });
  }
  const data = usedUIDs.get(uid);
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  }
  return data.count >= dailyLimit;
}

function increase(uid) {
  usedUIDs.get(uid).count++;
}

// Like Handler
app.get('/like', async (req, res) => {
  const { uid, server_name, key } = req.query;

  if (!uid || !server_name || !key) {
    return res.status(400).json({ status: 0, message: "Missing parameters" });
  }

  if (key !== "YOUR_SECRET_API_KEY") {
    return res.status(403).json({ status: 0, message: "Invalid API Key" });
  }

  if (hasUsed(uid)) {
    return res.status(429).json({ status: 0, message: "Daily limit reached for this UID" });
  }

  try {
    // Call actual FF like service or mock data:
    const LikesBeforeCommand = Math.floor(Math.random() * 1000);
    const LikesGivenByAPI = Math.floor(Math.random() * 100) + 1;
    const LikesAfterCommand = LikesBeforeCommand + LikesGivenByAPI;
    const PlayerNickname = "FF_Player_" + uid.slice(-4);

    increase(uid);

    return res.json({
      LikesGivenByAPI,
      LikesBeforeCommand,
      LikesAfterCommand,
      PlayerNickname,
      UID: uid,
      status: 1,
      Developer: "API by Ruhan ~ Dev by ChatGPT"
    });
  } catch (e) {
    return res.status(500).json({ status: 0, message: "API error", error: e.toString() });
  }
});

app.listen(port, () => {
  console.log(`✅ FF Like API is running on port ${port}`);
});
