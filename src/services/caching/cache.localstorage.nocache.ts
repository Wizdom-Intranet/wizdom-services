import { IWizdomLocalstorageCache } from "./cache.interfaces";

export class WizdomLocalStorageNoCache implements  IWizdomLocalstorageCache {
   
    public ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number = 0): Promise<T> {        
        return func().then(result => {            
            return result as T;
        });        
    }
}