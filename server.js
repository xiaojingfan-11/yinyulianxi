const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8765;
const maxAudioBytes = 20 * 1024 * 1024;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);

  if (request.method === "POST" && url.pathname === "/api/transcribe") {
    await handleTranscribe(request, response);
    return;
  }

  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1");

async function handleTranscribe(request, response) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      sendJson(response, 500, { error: "OPENAI_API_KEY is not set on the server." });
      return;
    }

    const chunks = [];
    let total = 0;
    for await (const chunk of request) {
      total += chunk.length;
      if (total > maxAudioBytes) {
        sendJson(response, 413, { error: "Audio is too large." });
        return;
      }
      chunks.push(chunk);
    }

    const audio = Buffer.concat(chunks);
    if (!audio.length) {
      sendJson(response, 400, { error: "No audio received." });
      return;
    }

    const contentType = request.headers["content-type"] || "audio/webm";
    const extension = audioExtension(contentType);
    const form = new FormData();
    form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
    form.append("language", "en");
    form.append("file", new Blob([audio], { type: contentType }), `reading.${extension}`);

    const apiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const payload = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      sendJson(response, apiResponse.status, {
        error: payload.error?.message || "Transcription failed."
      });
      return;
    }

    sendJson(response, 200, { text: payload.text || "" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

function audioExtension(contentType) {
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("ogg")) return "ogg";
  return "webm";
}
