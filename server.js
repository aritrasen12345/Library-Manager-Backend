/* eslint-disable no-console */
const http = require("http");
const debug = require("debug")("node-angular");
const app = require("./app");

const port = process.env.PORT || 4000;
app.set("port", port);

const server = http.createServer(app);
const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  debug(`Listening on ${bind}`);
};
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => {
  console.log(`Server Started On Port:- ${port} in ${process.env.NODE_ENV} mode`);
});
