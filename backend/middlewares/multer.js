const multer = require("multer");

// Configurazione: teniamo il file in memoria (RAM) come Buffer
const storage = multer.memoryStorage();

// Limiti di sicurezza (es. max 10MB per file)
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;
