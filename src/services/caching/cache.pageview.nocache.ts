import { IWizdomPageViewCache } from "./cache.interfaces";

export class WizdomPageViewNoCache implements  IWizdomPageViewCache {
   
    public ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : T {
        var result = func();
        return result as T;
    }
}