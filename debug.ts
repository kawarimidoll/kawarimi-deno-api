import { serve } from "./src/deps.ts";
import requestHandler from "./api/server.ts";

const port = 8080;
const server = serve({ port });
console.log(
  `HTTP webserver running. Access it at: http://localhost:${port}/`,
);

for await (const request of server) {
  requestHandler(request);
}
