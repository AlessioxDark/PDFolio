const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Funziona!</h1>");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
// await supabase.from("test").insert([{ col: "es" }]);
