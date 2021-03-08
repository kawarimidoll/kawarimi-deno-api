import { ServerRequest } from "../src/deps.ts";

export default (req: ServerRequest) => {
  req.respond({ body: "Hello deno-api!" });
};
