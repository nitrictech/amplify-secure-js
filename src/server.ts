// Copyright 2022, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import Cookies from "cookies";
import UniversalCookie from "universal-cookie";
import { PREFIX } from "./constants";
import { Store } from "./storage";

export const setAuthStorageServer = (req: any, res: any, data: any) => {
  // Create a cookies instance
  const cookies = new Cookies(req, res);

  for (const key of Object.keys(data)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key, data[key], {
        httpOnly: true,
      });
    }
  }
};

export const removeAuthStorageServer = (req: any, res: any) => {
  // Create a cookies instance
  const cookies = new Cookies(req, res);
  const all = new UniversalCookie(req.headers.cookie || "").getAll();

  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      cookies.set(key);
    }
  }
};

export const getAuthStorageServer = (req: any) => {
  const all = new UniversalCookie(req.headers.cookie || "").getAll();
  const storageData: Store = {};

  for (const key of Object.keys(all)) {
    if (key.startsWith(PREFIX)) {
      storageData[key] = all[key];
    }
  }

  return storageData;
};
