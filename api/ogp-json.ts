// [JavaScriptでURLからOGP取得する - Qiita](https://qiita.com/ksyunnnn/items/bfe2b9c568e97bb6b494)
import { DOMParser, ServerRequest } from "../src/deps.ts";
import { parseParams } from "../src/utils.ts";
import "https://deno.land/x/dotenv@v2.0.0/load.ts";

// cache two hours
const CACHE_MAX_AGE = 7200;

const ogpJson = (url: string) =>
  fetch(url).then((res) => res.text()).then((text) => {
    const el = new DOMParser().parseFromString(text, "text/html");
    if (el == null) {
      return {};
    }

    const ogp = [...el.head.children]
      .reduce((acc, crnt) => {
        const prop = crnt.getAttribute("property");
        if (prop != null) {
          acc[prop] = crnt.getAttribute("content")?.replace(/"|\n/g, "") ?? "";
        }
        return acc;
      }, {} as { [key: string]: string });

    ogp["og:title"] ??= el.title;
    ogp["og:url"] ??= url;

    return ogp;
  })
    .catch((error) => ({ error }));

export default async (req: ServerRequest) => {
  // [How can I enable CORS on Vercel? - Vercel Support Article](https://vercel.com/support/articles/how-to-enable-cors)
  if (req.method === "OPTIONS") {
    const headers = new Headers({
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    });
    req.respond({ status: 200, headers });
    return;
  }
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
  });
  const apiKey = req.headers.get("X-API-KEY");
  if (apiKey !== Deno.env.get("X_API_KEY")) {
    req.respond({ status: 401, headers, body: '{"error": "not allowed"}' });
    return;
  }

  const params = parseParams(req);
  const url = params?.get("url");
  if (url == null || url == "") {
    req.respond({
      status: 401,
      headers,
      body: '{"error": "url parameter is required"}',
    });
    return;
  }
  const json = await ogpJson(url);
  req.respond({ status: 200, headers, body: JSON.stringify(json) });
};
