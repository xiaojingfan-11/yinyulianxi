const maxAudioBytes = 20 * 1024 * 1024;

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

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
};

function sendJson(response, status, data) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(data));
}

function audioExtension(contentType) {
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("ogg")) return "ogg";
  return "webm";
}
