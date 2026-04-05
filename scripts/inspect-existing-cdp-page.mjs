import { mkdir, writeFile } from "node:fs/promises";

const wsUrl = process.env.CDP_WS_URL;
const outPrefix = process.env.OUT_PREFIX ?? "studybites-live";

if (!wsUrl) {
  throw new Error("CDP_WS_URL is required");
}

await mkdir("docs/design-references", { recursive: true });
await mkdir("docs/research/studybites-live", { recursive: true });

const ws = new WebSocket(wsUrl);
const inflight = new Map();
let messageId = 0;

await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

ws.addEventListener("message", (event) => {
  const payload = JSON.parse(event.data);
  if (!payload.id) {
    return;
  }
  const callback = inflight.get(payload.id);
  if (!callback) {
    return;
  }
  inflight.delete(payload.id);
  if (payload.error) {
    callback.reject(new Error(payload.error.message));
  } else {
    callback.resolve(payload.result);
  }
});

async function send(method, params = {}) {
  const id = ++messageId;
  ws.send(JSON.stringify({ id, method, params }));
  return await new Promise((resolve, reject) => {
    inflight.set(id, { resolve, reject });
  });
}

await send("Page.enable");
await send("Runtime.enable");

const title = await evaluate("document.title");
const url = await evaluate("window.location.href");

await capture("desktop", 1440, 2200, 1);
await capture("mobile", 390, 844, 2);

const html = await evaluate("document.documentElement.outerHTML");
const text = await evaluate("document.body.innerText");
const sections = await evaluate(`
  (() => {
    return [...document.querySelectorAll('button,a,h1,h2,h3,p,section,article,aside,main')]
      .slice(0, 300)
      .map((node) => ({
        tag: node.tagName,
        text: (node.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 180),
        className: typeof node.className === 'string' ? node.className : '',
        href: node instanceof HTMLAnchorElement ? node.href : undefined,
      }));
  })();
`);

await writeFile(`docs/research/studybites-live/${outPrefix}.html`, String(html));
await writeFile(`docs/research/studybites-live/${outPrefix}.txt`, String(text));
await writeFile(
  `docs/research/studybites-live/${outPrefix}.json`,
  JSON.stringify({ title, url, sections }, null, 2),
);

ws.close();

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result?.value;
}

async function capture(label, width, height, deviceScaleFactor) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile: width < 700,
  });
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  await writeFile(
    `docs/design-references/${outPrefix}-${label}.png`,
    Buffer.from(shot.data, "base64"),
  );
}
