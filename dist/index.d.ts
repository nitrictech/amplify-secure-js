import { Auth } from 'aws-amplify';
import Cookies from 'universal-cookie';

declare type Store = Record<string, string>;
declare type Context = {
    req?: any;
};
declare class AmplifyStorage implements Storage {
    cookies: Cookies;
    store: Store;
    constructor(context?: Context);
    get length(): number;
    clear(): void;
    getItem(key: keyof Store): string | null;
    protected getLocalItem(key: keyof Store): string | null;
    protected getKey(key: string): string;
    key(index: number): string;
    removeItem(key: string): void;
    protected removeLocalItem(key: keyof Store): void;
    protected removeServerItem(key: keyof Store): void;
    setItem(key: keyof Store, value: string): void;
    protected setLocalItem(key: keyof Store, value: string): void;
    protected setServerItem(key: keyof Store, value: string): void;
    resetStore(store: Store): void;
}

declare const amplifyLocalStorage: AmplifyStorage;
interface StorageReturn {
    success: boolean;
}
/**
 * Sends auth storage to server for secure cookie storage
 * @returns
 */
declare const sendAuthStorage: () => Promise<StorageReturn>;
declare const restoreAuthenticatedUser: typeof Auth.currentAuthenticatedUser;
declare const amplifySignOut: typeof Auth.signOut;

declare const setAuthStorageServer: (req: any, res: any, data: any) => void;
declare const removeAuthStorageServer: (req: any, res: any) => void;
declare const getAuthStorageServer: (req: any) => Store;

export { AmplifyStorage, StorageReturn, Store, amplifyLocalStorage, amplifySignOut, getAuthStorageServer, removeAuthStorageServer, restoreAuthenticatedUser, sendAuthStorage, setAuthStorageServer };
