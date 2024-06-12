const express = require("express");
const fs = require("fs");

const app = express();

const port = process.argv[2];
const dir = process.argv[3];

if (!port || !dir) {
  console.error("Usage: node server.js <port> <directory> <file>");
  process.exit(1);
}

app.use(express.static(dir));

app.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  const contentFilePath = `${dir}/${filename}`;
  fs.readFile(contentFilePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.set("Content-Type", "text/html");
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
