const wsUrl = process.env.CDP_WS_URL;
const expression = process.env.CDP_EXPRESSION;

if (!wsUrl || !expression) {
  throw new Error("CDP_WS_URL and CDP_EXPRESSION are required");
}

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

await send("Runtime.enable");

const result = await send("Runtime.evaluate", {
  expression,
  returnByValue: true,
  awaitPromise: true,
});

console.log(JSON.stringify(result.result?.value ?? null, null, 2));
ws.close();
