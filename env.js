const globals = globalThis;

function defineGlobal(name, value) {
  if (!(name in globals)) {
    Object.defineProperty(globals, name, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    });
  }
  return globals[name];
}


function replaceGlobal(name, value) {
  Object.defineProperty(globals, name, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
  return value;
}
class BrowserStorage {
  #items = new Map();

  get length() {
    return this.#items.size;
  }

  clear() {
    this.#items.clear();
  }

  getItem(key) {
    key = String(key);
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  key(index) {
    return [...this.#items.keys()][index] ?? null;
  }

  removeItem(key) {
    this.#items.delete(String(key));
  }

  setItem(key, value) {
    this.#items.set(String(key), String(value));
  }
}

class BrowserElement extends EventTarget {
  constructor(tagName = "div") {
    super();
    this.tagName = String(tagName).toUpperCase();
    this.nodeName = this.tagName;
    this.nodeType = 1;
    this.style = {};
    this.children = [];
    this.attributes = Object.create(null);
    this.parentNode = null;
    this.textContent = "";
    this.innerHTML = "";
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  setAttribute(name, value) {
    this.attributes[String(name)] = String(value);
  }

  getAttribute(name) {
    return this.attributes[String(name)] ?? null;
  }

  removeAttribute(name) {
    delete this.attributes[String(name)];
  }

  getContext() {
    return null;
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

class BrowserDocument extends EventTarget {
  constructor() {
    super();
    this.nodeType = 9;
    this.readyState = "complete";
    this.visibilityState = "visible";
    this.hidden = false;
    this.cookie = "";
    this.referrer = "";
    this.domain = "www.douyin.com";
    this.documentElement = new BrowserElement("html");
    this.head = new BrowserElement("head");
    this.body = new BrowserElement("body");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
  }

  createElement(tagName) {
    return new BrowserElement(tagName);
  }

  createTextNode(text) {
    return { nodeName: "#text", nodeType: 3, textContent: String(text) };
  }

  getElementById() {
    return null;
  }

  getElementsByTagName(tagName) {
    const name = String(tagName).toLowerCase();
    if (name === "html") return [this.documentElement];
    if (name === "head") return [this.head];
    if (name === "body") return [this.body];
    return [];
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

class BrowserXMLHttpRequest extends EventTarget {
  constructor() {
    super();
    this.readyState = 0;
    this.status = 0;
    this.response = null;
    this.responseText = "";
    this.responseType = "";
    this.timeout = 0;
    this.withCredentials = false;
    this.headers = Object.create(null);
  }

  open(method, url, async = true) {
    this.method = String(method);
    this.url = String(url);
    this.async = Boolean(async);
    this.readyState = 1;
  }

  setRequestHeader(name, value) {
    this.headers[String(name).toLowerCase()] = String(value);
  }

  getAllResponseHeaders() {
    return "";
  }

  getResponseHeader() {
    return null;
  }

  send(body = null) {
    this.requestBody = body;
  }

  abort() {
    this.readyState = 0;
  }
}

const location = defineGlobal("location", {
  href: "https://www.douyin.com/",
  origin: "https://www.douyin.com",
  protocol: "https:",
  host: "www.douyin.com",
  hostname: "www.douyin.com",
  port: "",
  pathname: "/",
  search: "",
  hash: "",
  assign(url) {
    this.href = String(url);
  },
  replace(url) {
    this.href = String(url);
  },
  reload() {},
  toString() {
    return this.href;
  },
});
defineGlobal("window", globals);
defineGlobal("self", globals);
defineGlobal("top", globals);
defineGlobal("parent", globals);
defineGlobal("document", new BrowserDocument());
replaceGlobal("localStorage", new BrowserStorage());
replaceGlobal("sessionStorage", new BrowserStorage());
replaceGlobal("navigator", {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
  language: "en",
  languages: ["en"],
  platform: "MacIntel",
  hardwareConcurrency: 10,
  deviceMemory: 16,
  onLine: true,
  vendor: "Google Inc.",
  connection: {
    downlink: 10,
    effectiveType: "4g",
    rtt: 0,
    saveData: false,
  },
});
defineGlobal("XMLHttpRequest", BrowserXMLHttpRequest);
defineGlobal("HTMLElement", BrowserElement);
defineGlobal("Element", BrowserElement);
defineGlobal("screen", {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1080,
  colorDepth: 24,
  pixelDepth: 24,
});
defineGlobal("devicePixelRatio", 1);
defineGlobal("innerWidth", 1920);
defineGlobal("innerHeight", 1080);
defineGlobal("outerWidth", 1920);
defineGlobal("outerHeight", 1080);
defineGlobal("addEventListener", () => {});
defineGlobal("removeEventListener", () => {});
defineGlobal("dispatchEvent", () => true);
defineGlobal("requestAnimationFrame", () => 0);
defineGlobal("cancelAnimationFrame", () => {});
defineGlobal("requestIdleCallback", () => 0);
defineGlobal("cancelIdleCallback", () => {});
defineGlobal("getComputedStyle", (element) => element?.style ?? {});
defineGlobal("alert", () => {});
defineGlobal("confirm", () => false);
defineGlobal("prompt", () => null);
defineGlobal("c", undefined);

// 即使部分 Node.js 版本以访问器形式暴露其他 Web 全局对象，
// 也要保证 location 可以通过 window 访问。
globals.window.location = location;
