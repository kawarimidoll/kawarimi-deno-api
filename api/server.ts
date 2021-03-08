import { ServerRequest } from "./deps.ts";

export default (req: ServerRequest) => {
  req.respond({ body: "Hello deno-api!" });
};
