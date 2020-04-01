import { ICacheObject, IWizdomPageViewCache } from "./cache.interfaces";
import { WizdomCache } from "./cache";

export class WizdomPageViewCache implements IWizdomPageViewCache {
    
    constructor(private parent: WizdomCache, private forceNoCache: boolean) {
        
    }

    private GetCache(): object{
        let globalCacheVariable = this.parent.getGlobalVariable();
        var funcCacheVariable = "PageView";
        if(globalCacheVariable[funcCacheVariable] == null)
            globalCacheVariable[funcCacheVariable] = {};
        return globalCacheVariable[funcCacheVariable];
    }
    
    private GetCacheObject<T>(key: string): ICacheObject<T> {    
        return this.GetCache()[key.replace(/[\W_]+/g,"")] as ICacheObject<T>;;
    }

    private SetCacheObject<T>(key: string, funcResult: T) {    
        var cacheObj = {
            data: funcResult,
            created: new Date(Date.now()).toUTCString()
        } as ICacheObject<T>;
        this.GetCache()[key.replace(/[\W_]+/g,"")] = cacheObj;
    }

    /**
     * @param key  Should be [Module].[Function] ex. Megamenu.GetMenu:user(at)wizdom.onmicrosoft.com:da-dk
     * @param func  Any function
     * @param expiresInMilliseconds  The func will not be invoked again within the expire period.
     */
    public async ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : Promise<T> {            
        var cacheObj = this.GetCacheObject(key);
        if (!this.forceNoCache && cacheObj && cacheObj.created) {
            var now = new Date(Date.now());
            var created = new Date(cacheObj.created);
            var expires = new Date(created.getTime() + expiresInMilliseconds);

            if (expires.getTime() > now.getTime()) {                
                return cacheObj.data as T;            
            }            
        }
        var result = await func();
        this.SetCacheObject(key, result);
        return result as T;        
    }
}