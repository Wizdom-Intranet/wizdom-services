import { ICacheObject, IWizdomPageViewCache } from "./cache.interfaces";

export class WizdomPageViewCache implements IWizdomPageViewCache {

    private GetCache(): object{    
        var funcCacheVariable = "WizdomPageViewCache";
        if(window[funcCacheVariable] == null)
            window[funcCacheVariable] = {};
        return window[funcCacheVariable];
    }
    private GetCacheObject<T>(key: string): ICacheObject<T> {    
        return this.GetCache()[key.replace(/[\W_]+/g,"")] as ICacheObject<T>;;
    }

    private SetCacheObject<T>(key: string, funcResult: T) {    
        var cacheObj = {
            data: funcResult,
            created: new Date().toUTCString()
        } as ICacheObject<T>;
        this.GetCache()[key.replace(/[\W_]+/g,"")] = cacheObj;
    }

    /**
     * @param key  Should be [Module].[Function] ex. Megamenu.GetMenu:user(at)wizdom.onmicrosoft.com:da-dk
     * @param func  Any function
     * @param expiresInMilliseconds  The func will not be invoked again within the expire period.
     */
    public ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : T {            
        var cacheObj = this.GetCacheObject(key);
        if (cacheObj && cacheObj.created) {
            var now = new Date();
            var created = new Date(cacheObj.created);
            var expires = new Date(created.getTime() + expiresInMilliseconds);

            if (expires.getTime() > now.getTime()) {                
                return cacheObj.data as T;            
            }            
        }
        var result = func();
        this.SetCacheObject(key, result);
        return result as T;        
    }
}