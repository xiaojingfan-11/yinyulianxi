const fs = require("fs");
const path = require("path");

module.exports = function handler(request, response) {
  const filePath = path.join(process.cwd(), "public", "index.html");
  const html = fs.readFileSync(filePath, "utf8");
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.statusCode = 200;
  response.end(html);
};
