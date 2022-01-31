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
import { PREFIX } from './constants';
import { AmplifyStorage } from './storage';

describe('Storage Tests', () => {
  describe('Given a new AmplifyStorage', () => {
    test('Then storage should be able to set and get items', () => {
      const storage = new AmplifyStorage();
      storage.setItem('key', 'value1');

      expect(storage.getItem('key')).toEqual('value1');
    });
    test('Then storage should be able to clear items', () => {
      const storage = new AmplifyStorage();

      storage.setItem('key', 'value1');
      storage.clear();
      expect(storage.getItem('key')).toBeNull();
    });

    test('Should initialize prefixed cookies when not browser and has ctx', () => {
      const ctx = {
        req: {
          headers: {
            cookie: PREFIX + 'test=value',
          },
        },
      };
      const storage = new AmplifyStorage(ctx);

      expect(storage.getItem('test')).toEqual('value');
    });
    test('Should remove prefixed cookies when not browser and has ctx', () => {
      const ctx = {
        req: {
          headers: {
            cookie: PREFIX + 'test=value',
          },
        },
      };
      const storage = new AmplifyStorage(ctx);
      storage.removeItem('test');

      expect(storage.getItem('test')).toBeNull();
    });
    test('Should not use cookies for setting when in browser', () => {
      global.window = {
        document: {},
      } as any;

      const storage = new AmplifyStorage();
      storage.setItem('test', 'value');

      expect(storage.store).toEqual({
        [PREFIX + 'test']: 'value',
      });
      expect(Object.keys(storage.cookies.getAll()).length).toEqual(0);
    });
  });
});
