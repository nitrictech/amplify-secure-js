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
import { Auth } from 'aws-amplify';
import { AmplifyStorage } from './storage';

const AUTH_PATH = process.env.NITRIC_AMPLIFY_AUTH_PATH || '/api/auth';

export const amplifyLocalStorage = new AmplifyStorage();

export interface StorageReturn {
  success: boolean;
}

/**
 * Sends auth storage to server for secure cookie storage
 * @returns
 */
export const sendAuthStorage = async (): Promise<StorageReturn> => {
  const res = await fetch(AUTH_PATH, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({
      data: amplifyLocalStorage.store,
    }),
  });

  if (res.status !== 200) {
    throw res;
  }

  return res.json();
};

const removeAuthStorage = async (): Promise<StorageReturn> => {
  const res = await fetch(AUTH_PATH, {
    method: 'DELETE',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
  });

  if (res.status !== 200) {
    throw res;
  }

  return res.json();
};

export const restoreAuthenticatedUser: typeof Auth.currentAuthenticatedUser =
  async (params) => {
    try {
      const user = await Auth.currentAuthenticatedUser(params);

      return user;
    } catch (e) {
      const res = await fetch(AUTH_PATH, {
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
      });

      if (res.status !== 200) {
        throw res;
      }

      const { data } = await res.json();

      // set storage
      if (Object.keys(data).length) {
        amplifyLocalStorage.resetStore(data);
      }

      const user = await Auth.currentAuthenticatedUser(params);

      return user;
    }
  };

export const amplifySignOut: typeof Auth.signOut = async (opts) => {
  const res = await Auth.signOut(opts);

  // remove cookies from server
  await removeAuthStorage();

  return res;
};
