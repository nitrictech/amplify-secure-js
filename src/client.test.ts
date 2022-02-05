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
import { amplifySignOut, restoreAuthenticatedUser, sendAuthStorage } from '.';
import { AmplifyStorage } from './storage';

jest.mock('aws-amplify');
jest.mock('./storage');

const mockFetch = jest.fn();
const mockHeaders = jest.fn();

const origFetch = global.fetch;

beforeAll(() => {
    global.fetch = mockFetch;
    global.Headers = mockHeaders;
})

afterAll(() => {
    global.fetch = origFetch;
    jest.clearAllMocks();
});

describe("sendAuthStorage", () => {
    describe("when auth storage is successfully sent", () => {
        const mockReturn = { test: "test" };
        let response: any;
        beforeAll(async () => {
            mockFetch.mockResolvedValueOnce(Promise.resolve({
                status: 200,
                json: () => mockReturn
            }));
            response = await sendAuthStorage();
        });

        afterAll(() => {
            jest.resetAllMocks();
        })

        test("it should set content-type of headers to application/json", () => {
            expect(mockHeaders).toBeCalledTimes(1);
            expect(mockHeaders).toBeCalledWith({ 'Content-Type': 'application/json' })
        })
        test("it should call fetch on AUTH_PATH", () => {
            expect(mockFetch).toBeCalledTimes(1);
            expect(mockFetch).toBeCalledWith('/api/auth', {
                method: 'POST',
                headers: expect.anything(),
                credentials: 'same-origin',
                // TODO: Verify by mocking store contents
                body: expect.anything(),
            });
        });

        test("it should return the response", () => {
            expect(response).toBe(mockReturn)
        });
    });

    describe("when auth storage fails to send", () => {
        const mockResponse = Promise.resolve({
            status: 400,
        });
        beforeAll(async () => {
            mockFetch.mockResolvedValueOnce(mockResponse);
        });

        afterAll(() => {
            jest.resetAllMocks();
        });

        test("should throw the response", async () => {
            await expect(sendAuthStorage).rejects.toBe(await mockResponse)
        });
    });
});

describe("amplifySignOut", () => {
    const mockSignoutResponse = { mock: "test" };
    let mockAuth: jest.SpyInstance;

    beforeAll(() => {
        mockAuth = jest.spyOn(Auth, 'signOut')
        .mockResolvedValue(Promise.resolve(mockSignoutResponse));
    });

    afterAll(() => {
        mockAuth.mockClear();
    });

    describe("when auth storage is successfully sent", () => {
        const mockReturn = { test: "test" };
        let response: any;
        beforeAll(async () => {
            mockFetch.mockResolvedValueOnce(Promise.resolve({
                status: 200,
                json: () => mockReturn
            }));
            response = await amplifySignOut();
        });

        afterAll(() => {
            jest.resetAllMocks();
        })

        test("it should set content-type of headers to application/json", () => {
            expect(mockHeaders).toBeCalledTimes(1);
            expect(mockHeaders).toBeCalledWith({ 'Content-Type': 'application/json' })
        })
        test("it should call fetch on AUTH_PATH", () => {
            expect(mockFetch).toBeCalledTimes(1);
            expect(mockFetch).toBeCalledWith('/api/auth', {
                method: 'DELETE',
                headers: expect.anything(),
                credentials: 'same-origin',
            });
        });

        test("it should return the response", () => {
            expect(response).toBe(mockSignoutResponse)
        });
    });

    describe("when auth storage fails to send", () => {
        const mockResponse = Promise.resolve({
            status: 400,
        });

        beforeAll(async () => {
            mockFetch.mockResolvedValueOnce(mockResponse);
        });

        afterAll(() => {
            jest.resetAllMocks();
        });

        test("should throw the bad http response", async () => {
            await expect(amplifySignOut).rejects.toBe(await mockResponse)
        });
    });
});

describe("restoreAuthenticatedUser", () => {
    const mockParams: any = { mock: "test" };
    const mockUser = { mock: "user" };
    describe('when current user exists', () => {
        let mockAuth: jest.SpyInstance;
        let response: any;

        beforeAll(async () => {
            mockAuth = jest.spyOn(Auth, 'currentAuthenticatedUser')
            .mockResolvedValueOnce(Promise.resolve(mockUser));
            response = await restoreAuthenticatedUser(mockParams);
        });

        test("should call Auth.currentAuthenticatedUser", () => {
            expect(mockAuth).toBeCalledTimes(1);
            expect(mockAuth).toBeCalledWith(mockParams);
        });
        
        test("should return the user", () => {
            expect(response).toBe(mockUser);
        });
        
    });

    describe('when current user does not exist', () => {
        const mockParams: any = { mock: "test" };
        const mockUser = { mock: "user" };
        let mockAuth: jest.SpyInstance;

        describe("when auth fetch fails", () => {
            const mockResponse = {
                status: 400,
            };
            beforeAll(async () => {
                mockAuth = jest.spyOn(Auth, 'currentAuthenticatedUser')
                .mockResolvedValueOnce(Promise.reject("mock-error"));
                mockFetch.mockResolvedValueOnce(Promise.resolve(mockResponse));
            });

            test("should call Auth.currentAuthenticatedUser", () => {
                expect(mockAuth).toBeCalledTimes(1);
                expect(mockAuth).toBeCalledWith(mockParams);
            })

            test("should throw the bad response", async () => {
                await expect(async () => restoreAuthenticatedUser(mockParams)).rejects.toBe(mockResponse);
            });
        });

        describe("when auth fetch succeeds", () => {
            let mockResetStore: jest.SpyInstance;
            const mockResponse = {
                status: 200,
                json: () => ({ data: { mock: "test" } })
            };
            let response: any;
            beforeAll(async () => {
                mockResetStore = jest.spyOn(AmplifyStorage.prototype, 'resetStore');
                mockAuth = jest.spyOn(Auth, 'currentAuthenticatedUser')
                .mockResolvedValueOnce(Promise.reject("mock-error"))
                .mockResolvedValueOnce(Promise.resolve(mockUser));
                mockFetch.mockResolvedValueOnce(Promise.resolve(mockResponse));
                
                response = await restoreAuthenticatedUser(mockParams);
            });

            test("should reset amplify storage to server auth", () => {
                expect(mockResetStore).toBeCalledWith(mockResponse.json().data);
            });

            test("should return the authenticated user", () => {
                expect(response).toBe(mockUser);
            });
        });
    });
});