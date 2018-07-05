import { ICacheObject, IWizdomLocalstorageCache } from "./cache.interfaces";

export class WizdomLocalStorageCache implements IWizdomLocalstorageCache {

    private GetCacheObject<T>(key: string): ICacheObject<T> {
        var cachedStr = window.localStorage.getItem("Wizdom:" + key);
        return JSON.parse(cachedStr) as ICacheObject<T>;
    }
    
    private SetCacheObject<T>(key: string, data: T) {
        var cacheObj = JSON.stringify({
            data,
            created: new Date().toUTCString()
        } as ICacheObject<T>);
        window.localStorage.setItem("Wizdom:" + key, cacheObj);
    }
    
    /**
     * @param key  Should be [Module].[Function]:[variables] ex. Megamenu.GetMenu:user(at)wizdom.onmicrosoft.com:da-dk
     * @param func  A function that returns a promise.
     * @param expiresInMilliseconds  If the cache has not been updated within the expiration period. The func will be executed immediately.
     * @param refreshInMilliseconds  If the cache has not been updated within the refresh period. The cached data will be returned and the func will be executed in the background.
     * @param refreshDelayInMilliseconds  If the refresh period is expired. The func will be executed delayed by these seconds. Use this to remove load from the first few seconds of a pageload.
     * @returns Promise<T>
     */
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number = 0): Promise<T> {        
        var forceNoCache = window.location.search.toLowerCase().indexOf("nocache=true") != -1;
        var cacheObj = this.GetCacheObject(key);
        if (!forceNoCache && cacheObj && cacheObj.created && cacheObj.data) {
            var now = new Date();
            var created = new Date(cacheObj.created);
            var expires = new Date(created.getTime() + expiresInMilliseconds);
            if (expires > now) {                
                var refreshTime = new Date(created.getTime() + refreshInMilliseconds);
                if (refreshTime < now) {                    
                    setTimeout(() => {                        
                        func().then(result => {
                            this.SetCacheObject(key, result);
                        });
                    }, refreshDelayInMilliseconds);
                }
    
                return new Promise((resolve, reject) => {
                    resolve(cacheObj.data as T);
                });
            }
            else if (expires <= now) {                
                return func().then(result => {
                    this.SetCacheObject(key, result);
                    return result as T;
                });
            }
        }
        else {            
            return func().then(result => {
                this.SetCacheObject(key, result);
                return result as T;
            });
        }
    }
}