const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = 3001;

// =============================================
// Middleware Configuration
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static File Serving
app.use(express.static(path.join(__dirname, "public")));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/images', express.static(path.join(__dirname, 'public', 'assets', 'images')));

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
});

// =============================================
// Production API Endpoints (UNCHANGED)
// =============================================
const GOOGLE_API_KEY = "AIzaSyBoAmNMyi-pULIdPSAjDMbRsrHMWeXLLrE";
const dormPos = { lat: 14.603919, lng: 120.987760 };

/**
 * @route GET /api/staticmap
 * @desc Generates static map with route
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns PNG image
 */
app.get("/api/staticmap", async (req, res) => {
  try {
    const { userLat, userLng } = validateCoordinates(req.query);
    
    const mapUrl = buildMapUrl(userLat, userLng);
    const response = await axios.get(mapUrl, { 
      responseType: "arraybuffer",
      timeout: 5000 // 5 second timeout
    });
    
    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400" // 24hr cache
    }).send(response.data);
    
  } catch (err) {
    handleMapError(err, res);
  }
});

// =============================================
// AR Business Card Enhancements
// =============================================
/**
 * @route GET /api/businesscard
 * @desc Returns business card data for AR
 * @returns JSON { name, title, socialLinks }
 */
app.get("/api/businesscard", (req, res) => {
  res.json({
    name: "John Doe",
    title: "Senior Web Developer",
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe"
    }
  });
});

// =============================================
// Error Handling
// =============================================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// =============================================
// Helper Functions
// =============================================
function validateCoordinates({ userLat, userLng }) {
  if (!userLat || !userLng) {
    throw new Error("Missing coordinates");
  }
  return {
    userLat: parseFloat(userLat),
    userLng: parseFloat(userLng)
  };
}

function buildMapUrl(userLat, userLng) {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const markers = [
    `color:blue|${userLat},${userLng}`,
    `color:red|label:D|${dormPos.lat},${dormPos.lng}`
  ];
  const path = `color:0x0000ff80|weight:5|${userLat},${userLng}|${dormPos.lat},${dormPos.lng}`;
  
  return `${baseUrl}?size=512x512&scale=2&maptype=roadmap` +
         `&markers=${markers.join('&markers=')}` +
         `&path=${encodeURIComponent(path)}` +
         `&key=${GOOGLE_API_KEY}`;
}

function handleMapError(err, res) {
  console.error(`[${new Date().toISOString()}] Map Error:`, err.message);
  
  if (err.response) {
    return res.status(502).json({ 
      error: "Google Maps API unavailable" 
    });
  }
  
  res.status(400).json({ 
    error: err.message.includes("Missing") 
      ? "Missing coordinates" 
      : "Failed to generate map" 
  });
}

// =============================================
// Server Initialization
// =============================================
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  📌 Static files: ${path.join(__dirname, "public")}
  🌐 Access AR Card: http://localhost:${PORT}
  🗺️ Map API: http://localhost:${PORT}/api/staticmap?userLat=XX&userLng=YY
  `);
});

process.on("SIGINT", () => {
  console.log("\nServer shutting down...");
  process.exit(0);
});