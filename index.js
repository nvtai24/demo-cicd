const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js app deployed with GitHub Actions CI/CD!\n");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
