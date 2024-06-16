const express = require("express");
const fs = require("fs");

const app = express();

const port = process.argv[2];
const dir = process.argv[3];

if (!port || !dir) {
  console.error("Usage: node server.js <port> <directory> <file>");
  process.exit(1);
}

var nvimProcs = new Set();

function exitHandler() {
  if (nvimProcs.size == 0) {
    server.close();
    process.exit(0);
  }
}

process.on("SIGINT", exitHandler);
process.on("SIGTERM", monitorProcs);

function monitorProcs() {
  nvimProcs.forEach((pid) => {
    try {
      process.kill(pid, 0);
    } catch (_) {
      nvimProcs.delete(pid);
    }
  });
  exitHandler();
}

app.use(express.static(dir));
app.use(express.json());

app.get("/preview/:filename", (req, res) => {
  const filename = req.params.filename;
  const contentFilePath = `${dir}/${filename}`;
  fs.readFile(contentFilePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.set("Content-Type", "text/html");
    res.status(200).send(data);
  });
});

app.post("/status", (_, res) => {
  console.log("nvimProcs: ", nvimProcs);
  res.status(200).send({ nvimProcs: Array.from(nvimProcs) });
});

app.post("/connect", (req, res) => {
  nvimProcs.add(req.body.pid);
  res.status(200).send("OK");
});

app.post("/disconnect", (req, res) => {
  nvimProcs.delete(req.body.pid);
  res.status(200).send("OK");

  if (nvimProcs.size == 0) {
    setTimeout(() => {
      exitHandler();
    }, 1000);
  }
});

var server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  setInterval(monitorProcs, 1000 * 60 * 5);
});
