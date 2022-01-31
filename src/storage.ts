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
import Cookies from 'universal-cookie';
import { isBrowser, PREFIX } from './constants';

export type Store = Record<string, string>;

type Context = { req?: any };

export class AmplifyStorage implements Storage {
  cookies = new Cookies();
  store: Store = {};

  constructor(context: Context = {}) {
    if (!isBrowser && context.req) {
      this.cookies = new Cookies(context.req.headers.cookie);
      Object.assign(this.store, this.cookies.getAll());
    }
  }

  get length() {
    return Object.entries(this.store).length;
  }

  clear() {
    Array.from(new Array(this.length))
      .map((_, i) => this.key(i))
      .forEach((key) => this.removeItem(key));
  }

  getItem(key: keyof Store) {
    return this.getLocalItem(key);
  }

  protected getLocalItem(key: keyof Store) {
    return Object.prototype.hasOwnProperty.call(this.store, this.getKey(key))
      ? this.store[this.getKey(key)]
      : null;
  }

  protected getKey(key: string) {
    if (key.startsWith(PREFIX)) {
      return key;
    }

    return PREFIX + key;
  }

  key(index: number) {
    return Object.keys(this.store)[index];
  }

  removeItem(key: string) {
    this.removeLocalItem(key);

    if (!isBrowser && this.cookies) {
      this.removeServerItem(key);
    }
  }

  protected removeLocalItem(key: keyof Store) {
    delete this.store[this.getKey(key)];
  }

  protected removeServerItem(key: keyof Store) {
    this.cookies.remove(this.getKey(key));
  }

  setItem(key: keyof Store, value: string) {
    this.setLocalItem(key, value);

    // keys take the shape:
    //  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
    //  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
    const tokenType = key.split('.').pop();

    switch (tokenType) {
      // LastAuthUser is needed for computing other key names
      case 'LastAuthUser':

      // accessToken is required for CognitoUserSession
      case 'accessToken':

      // refreshToken originates on the client, but SSR pages won't fail when this expires
      // Note: the new `accessToken` will also be refreshed on the client (since Amplify doesn't set server-side cookies)
      case 'refreshToken':

      // Required for CognitoUserSession
      case 'idToken':
        isBrowser
          ? this.setLocalItem(key, value)
          : this.setServerItem(key, value);

      // userData is used when `Auth.currentAuthenticatedUser({ bypassCache: false })`.
      // Can be persisted to speed up calls to `Auth.currentAuthenticatedUser()`
      // case 'userData':

      // Ignoring clockDrift on the server for now, but needs testing
      // case 'clockDrift':
    }
  }

  protected setLocalItem(key: keyof Store, value: string) {
    this.store[this.getKey(key)] = value;
  }

  protected setServerItem(key: keyof Store, value: string) {
    this.cookies.set(this.getKey(key), value, {
      httpOnly: true,
    });
  }

  public resetStore(store: Store) {
    this.clear();

    this.store = { ...store };
  }
}
