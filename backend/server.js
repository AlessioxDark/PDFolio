const express = require("express");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const cors = require("cors");
const app = express();

app.use(express.json());
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
// Rotte API
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Funziona!</h1>");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
