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
import Cookies from 'cookies';
import UniversalCookie from 'universal-cookie';
import { IncomingMessage, ServerResponse } from 'http';
import { setAuthStorageServer } from './server';
import { getAuthStorageServer, removeAuthStorageServer } from '.';

jest.mock('http');
jest.mock('cookies');
jest.mock('universal-cookie');

afterAll(() => {
    jest.clearAllMocks();
});

describe('setAuthStorageServer tests', () => {
    const mockData = {
        '@nitric-amplify:test': 'test',
        'non-match': 'non-match'
    };

    describe("when setting auth storage server on a request/response", () => {
        const mockRequest = new IncomingMessage(null as any);
        const mockResponse = new ServerResponse(mockRequest);
        let setCookieSpy: jest.SpyInstance;

        beforeAll(() => {
            setCookieSpy = jest.spyOn(Cookies.prototype, 'set');
            setAuthStorageServer(mockRequest, mockResponse, mockData);
        });

        afterAll(() => {
            jest.resetAllMocks();
        });

        test("should create new cookies with the provided request and response", () => {
            expect(Cookies).toBeCalledWith(mockRequest, mockResponse);
        });

        test("it should set cookies from mock data with the @nitric-amplify prefix", () => {
            expect(setCookieSpy).toBeCalledTimes(1);
            expect(setCookieSpy).toBeCalledWith('@nitric-amplify:test', 'test', {
                httpOnly: true,
            });
        });
    });
});

describe('removeAuthStorageServer', () => {
    describe('when removing nitric cookies from requests/responses', () => {
        const mockRequest = new IncomingMessage(null as any);
        const mockResponse = new ServerResponse(mockRequest);
        mockRequest['headers'] = { cookie: 'mock-cookies' };
        let setCookieSpy: jest.SpyInstance;
        let mockCookieSpy: jest.SpyInstance;
        
        beforeAll(() => {
            setCookieSpy = jest.spyOn(Cookies.prototype, 'set');
            mockCookieSpy = jest.spyOn(UniversalCookie.prototype, 'getAll').mockReturnValue({
                'non-match': 'non-match',
                '@nitric-amplify:test': 'test',
            });
            removeAuthStorageServer(mockRequest, mockResponse);
        });

        afterAll(() => {
            jest.resetAllMocks();
            mockCookieSpy.mockClear();
        });

        test("should create new cookies with the provided request and response", () => {
            expect(Cookies).toBeCalledWith(mockRequest, mockResponse);
        });

        test("should create new universal cookies with the provided request request cookies", () => {
            expect(UniversalCookie).toBeCalledWith(mockRequest.headers.cookie);
        });

        test(`should remove cookies beginning with ${PREFIX}`, () => {
            expect(setCookieSpy).toBeCalledTimes(1);
            expect(setCookieSpy).toBeCalledWith('@nitric-amplify:test');
        });
    });
});

describe('getAuthStorageServer', () => {
    describe('when removing nitric cookies from requests/responses', () => {
        const mockRequest = new IncomingMessage(null as any);
        mockRequest['headers'] = { cookie: 'mock-cookies' };
        let mockCookieSpy: jest.SpyInstance;
        let data: any;
        
        beforeAll(() => {
            mockCookieSpy = jest.spyOn(UniversalCookie.prototype, 'getAll').mockReturnValue({
                'non-match': 'non-match',
                '@nitric-amplify:test': 'test',
            });
            data = getAuthStorageServer(mockRequest);
        });

        afterAll(() => {
            jest.resetAllMocks();
            mockCookieSpy.mockClear();
        });

        test("should create new universal cookies with the provided request request cookies", () => {
            expect(UniversalCookie).toBeCalledWith(mockRequest.headers.cookie);
        });

        test(`should return cookies beginning with ${PREFIX}`, () => {
            expect(data).toEqual({
                '@nitric-amplify:test': 'test',
            });
        });
    });
});