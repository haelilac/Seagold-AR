// server.js
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3001;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  

const GOOGLE_API_KEY = "AIzaSyBoAmNMyi-pULIdPSAjDMbRsrHMWeXLLrE";
const dormLat = 14.603919;
const dormLng = 120.987760;

app.get("/api/staticmap", async (req, res) => {
  const { userLat, userLng } = req.query;

  if (!userLat || !userLng) {
    return res.status(400).send("Missing user coordinates");
  }

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=512x512&scale=2&maptype=roadmap&markers=color:blue|${userLat},${userLng}&markers=color:red|label:D|${dormLat},${dormLng}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(mapUrl, { responseType: "arraybuffer" });
    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (err) {
    console.error("❌ Google API error:", err.response?.data || err.message);
    res.status(500).send("Map fetch failed");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
