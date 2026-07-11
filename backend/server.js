const express = require("express");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const folderRoutes = require("./routes/folderRoutes");
const searchRoutes = require("./routes/searchRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require("./routes/profileRoutes");

const cors = require("cors");
const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], // Fondamentale se usi i token di Supabase!
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
// Rotte API
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);

app.listen("0.0.0.0", () => {
  console.log("listening on port 0.0.0.0");
});
