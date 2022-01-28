var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/client.ts
import { Auth } from "aws-amplify";

// src/constants.ts
var PREFIX = "@nitric-amplify:";
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// src/storage.ts
import Cookies from "universal-cookie";
var AmplifyStorage = class {
  constructor(context = {}) {
    this.cookies = new Cookies();
    this.store = {};
    if (!isBrowser && context.req) {
      this.cookies = new Cookies(context.req.headers.cookie);
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
    const user = await Auth.currentAuthenticatedUser(params);
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
    const user = await Auth.currentAuthenticatedUser(params);
    return user;
  }
};
var amplifySignOut = async (opts) => {
  const res = await Auth.signOut(opts);
  await removeAuthStorage();
  return res;
};

// src/server.ts
import Cookies2 from "cookies";
import UniversalCookie from "universal-cookie";
var setAuthStorageServer = (req, res, data) => {
  const cookies = new Cookies2(req, res);
  for (const key of Object.keys(data)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key, data[key], {
        httpOnly: true
      });
    }
  }
};
var removeAuthStorageServer = (req, res) => {
  const cookies = new Cookies2(req, res);
  const all = new UniversalCookie(req.headers.cookie || "").getAll();
  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key);
    }
  }
};
var getAuthStorageServer = (req) => {
  const all = new UniversalCookie(req.headers.cookie || "").getAll();
  const storageData = {};
  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      storageData[key] = all[key];
    }
  }
  return storageData;
};
export {
  AmplifyStorage,
  amplifyLocalStorage,
  amplifySignOut,
  getAuthStorageServer,
  removeAuthStorageServer,
  restoreAuthenticatedUser,
  sendAuthStorage,
  setAuthStorageServer
};
