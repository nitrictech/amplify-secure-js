var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AmplifyStorage: () => AmplifyStorage,
  amplifyLocalStorage: () => amplifyLocalStorage,
  amplifySignOut: () => amplifySignOut,
  getAuthStorageServer: () => getAuthStorageServer,
  removeAuthStorageServer: () => removeAuthStorageServer,
  restoreAuthenticatedUser: () => restoreAuthenticatedUser,
  sendAuthStorage: () => sendAuthStorage,
  setAuthStorageServer: () => setAuthStorageServer
});

// src/client.ts
var import_aws_amplify = require("aws-amplify");

// src/constants.ts
var PREFIX = "@nitric-amplify:";
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// src/storage.ts
var import_universal_cookie = __toESM(require("universal-cookie"));
var AmplifyStorage = class {
  constructor(context = {}) {
    this.cookies = new import_universal_cookie.default();
    this.store = {};
    if (!isBrowser && context.req) {
      this.cookies = new import_universal_cookie.default(context.req.headers.cookie);
      Object.assign(this.store, this.cookies.getAll());
    }
  }
  get length() {
    return Object.entries(this.store).length;
  }
  clear() {
    Array.from(new Array(this.length)).map((_, i) => this.key(i)).forEach((key) => this.removeItem(key));
  }
  getItem(key) {
    return this.getLocalItem(key);
  }
  getLocalItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, this.getKey(key)) ? this.store[this.getKey(key)] : null;
  }
  getKey(key) {
    return PREFIX + key;
  }
  key(index) {
    return Object.keys(this.store)[index];
  }
  removeItem(key) {
    this.removeLocalItem(key);
    if (!isBrowser && this.cookies) {
      this.removeServerItem(key);
    }
  }
  removeLocalItem(key) {
    delete this.store[this.getKey(key)];
  }
  removeServerItem(key) {
    this.cookies.remove(this.getKey(key));
  }
  setItem(key, value) {
    this.setLocalItem(key, value);
    const tokenType = key.split(".").pop();
    switch (tokenType) {
      case "LastAuthUser":
      case "accessToken":
      case "refreshToken":
      case "idToken":
        isBrowser ? this.setLocalItem(key, value) : this.setServerItem(key, value);
    }
  }
  setLocalItem(key, value) {
    this.store[this.getKey(key)] = value;
  }
  setServerItem(key, value) {
    this.cookies.set(this.getKey(key), value, {
      httpOnly: true
    });
  }
  resetStore(store) {
    this.clear();
    this.store = __spreadValues({}, store);
  }
};

// src/client.ts
var AUTH_PATH = process.env.NITRIC_AMPLIFY_AUTH_PATH || "/api/auth";
var amplifyLocalStorage = new AmplifyStorage();
if (!isBrowser) {
  global.fetch = () => Promise.resolve({});
}
var sendAuthStorage = async () => {
  const res = await fetch(AUTH_PATH, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify({
      data: amplifyLocalStorage.store
    })
  });
  if (res.status !== 200) {
    throw res;
  }
  return res.json();
};
var removeAuthStorage = async () => {
  const res = await fetch(AUTH_PATH, {
    method: "DELETE",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin"
  });
  if (res.status !== 200) {
    throw res;
  }
  return res.json();
};
var restoreAuthenticatedUser = async (params) => {
  try {
    const user = await import_aws_amplify.Auth.currentAuthenticatedUser(params);
    return user;
  } catch (e) {
    const res = await fetch(AUTH_PATH, {
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin"
    });
    if (res.status !== 200) {
      throw res;
    }
    const { data } = await res.json();
    if (Object.keys(data).length) {
      amplifyLocalStorage.resetStore(data);
    }
    const user = await import_aws_amplify.Auth.currentAuthenticatedUser(params);
    return user;
  }
};
var amplifySignOut = async (opts) => {
  const res = await import_aws_amplify.Auth.signOut(opts);
  await removeAuthStorage();
  return res;
};

// src/server.ts
var import_cookies = __toESM(require("cookies"));
var import_universal_cookie2 = __toESM(require("universal-cookie"));
var setAuthStorageServer = (req, res, data) => {
  const cookies = new import_cookies.default(req, res);
  for (const key of Object.keys(data)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key, data[key], {
        httpOnly: true
      });
    }
  }
};
var removeAuthStorageServer = (req, res) => {
  const cookies = new import_cookies.default(req, res);
  const all = new import_universal_cookie2.default(req.headers.cookie || "").getAll();
  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key);
    }
  }
};
var getAuthStorageServer = (req) => {
  const all = new import_universal_cookie2.default(req.headers.cookie || "").getAll();
  const storageData = {};
  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      storageData[key] = all[key];
    }
  }
  return storageData;
};
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AmplifyStorage,
  amplifyLocalStorage,
  amplifySignOut,
  getAuthStorageServer,
  removeAuthStorageServer,
  restoreAuthenticatedUser,
  sendAuthStorage,
  setAuthStorageServer
});
