import { writeFile, mkdir } from "node:fs/promises";

const chromeHost = process.env.CHROME_HOST ?? "http://127.0.0.1:9222";
const loginUrl = process.env.STUDYBITES_LOGIN_URL ?? "https://app.studybites.ai/en/authenticate";
const targetUrl = process.env.STUDYBITES_TARGET_URL ?? "https://app.studybites.ai/en/library";
const email = process.env.STUDYBITES_EMAIL;
const password = process.env.STUDYBITES_PASSWORD;

if (!email || !password) {
  throw new Error("STUDYBITES_EMAIL and STUDYBITES_PASSWORD are required");
}

await mkdir("docs/design-references", { recursive: true });
await mkdir("docs/research/studybites", { recursive: true });

const version = await fetchJson(`${chromeHost}/json/version`);
const createResponse = await fetch(`${chromeHost}/json/new?about:blank`, { method: "PUT" });
const target = await createResponse.json();
const ws = new WebSocket(target.webSocketDebuggerUrl || version.webSocketDebuggerUrl);

const inflight = new Map();
const listeners = new Map();
let messageId = 0;

const opened = new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

ws.addEventListener("message", (event) => {
  const payload = JSON.parse(event.data);
  if (payload.id) {
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
    return;
  }

  const eventListeners = listeners.get(payload.method);
  if (eventListeners) {
    for (const listener of eventListeners) {
      listener(payload.params);
    }
  }
});

await opened;
console.log("cdp:connected");

async function send(method, params = {}) {
  const id = ++messageId;
  ws.send(JSON.stringify({ id, method, params }));
  return await new Promise((resolve, reject) => {
    inflight.set(id, { resolve, reject });
  });
}

function on(method, handler) {
  const current = listeners.get(method) ?? [];
  current.push(handler);
  listeners.set(method, current);
}

function waitForEvent(method, predicate = () => true, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${method}`));
    }, timeoutMs);

    const handler = (params) => {
      if (!predicate(params)) {
        return;
      }
      clearTimeout(timeout);
      const next = (listeners.get(method) ?? []).filter((fn) => fn !== handler);
      listeners.set(method, next);
      resolve(params);
    };

    on(method, handler);
  });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("DOM.enable");
console.log("cdp:domains-enabled");

await setViewport(1440, 2200, 1);
console.log("cdp:viewport-desktop");
await navigate(loginUrl);
console.log("cdp:navigated-login");
await waitFor(1500);

await evaluate(`
  (() => {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    if (!emailInput || !passwordInput) return { ok: false, reason: 'missing-inputs' };

    emailInput.focus();
    emailInput.value = ${JSON.stringify(email)};
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    passwordInput.focus();
    passwordInput.value = ${JSON.stringify(password)};
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

    const submitButton = document.querySelector('[data-testid="submit-login-form"]');
    submitButton?.click();

    return { ok: true };
  })();
`);
console.log("cdp:submitted-login");

await waitFor(6000);
console.log("cdp:post-submit-wait-complete");

let finalUrl = await evaluate("window.location.href");
console.log(`cdp:current-url:${finalUrl}`);
if (!String(finalUrl).includes("/library")) {
  await navigate(targetUrl);
  await waitFor(5000);
  finalUrl = await evaluate("window.location.href");
  console.log(`cdp:forced-target-url:${finalUrl}`);
}

const desktopShot = await capturePng("docs/design-references/library-page-desktop.png", 1440, 2400);
const mobileShot = await capturePng("docs/design-references/library-page-mobile.png", 390, 844);
console.log("cdp:screenshots-captured");
const html = await evaluate("document.documentElement.outerHTML");
const text = await evaluate("document.body.innerText");
const title = await evaluate("document.title");
const topology = await evaluate(`
  (() => {
    const selectors = ['header','nav','aside','main','section','footer','button','a'];
    return selectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].slice(0, 80).map((node) => ({
        selector,
        tag: node.tagName,
        text: (node.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 140),
        className: typeof node.className === 'string' ? node.className : '',
      })),
    );
  })();
`);

await writeFile("docs/research/studybites/library-page.html", String(html));
await writeFile("docs/research/studybites/library-page.txt", String(text));
await writeFile(
  "docs/research/studybites/library-page.json",
  JSON.stringify({ finalUrl, title, topology, desktopShot, mobileShot }, null, 2),
);
console.log("cdp:artifacts-written");

await fetch(`${chromeHost}/json/close/${target.id}`);
ws.close();

async function navigate(url) {
  await send("Page.navigate", { url });
  await Promise.race([
    waitForEvent("Page.loadEventFired", () => true, 12000),
    waitForEvent("Page.frameStoppedLoading", () => true, 12000),
    waitFor(4000),
  ]);
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result?.value;
}

async function setViewport(width, height, deviceScaleFactor) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile: width < 700,
  });
}

async function capturePng(filePath, width, height) {
  await setViewport(width, height, width < 700 ? 2 : 1);
  await waitFor(800);
  const result = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  await writeFile(filePath, Buffer.from(result.data, "base64"));
  return filePath;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return await response.json();
}

async function waitFor(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
