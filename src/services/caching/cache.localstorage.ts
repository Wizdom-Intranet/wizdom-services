import { ICacheObject, IWizdomLocalstorageCache, IWizdomPageViewCache, IWizdomTimestamps } from "./cache.interfaces";

export class WizdomLocalStorageCache implements IWizdomLocalstorageCache {

    constructor(private pageViewCache: IWizdomPageViewCache, private forceNoCache: boolean, private timestamps: IWizdomTimestamps) {

    }

    private GetCacheObject<T>(key: string): ICacheObject<T> {
        var cachedStr = window.localStorage.getItem("Wizdom:" + key);
        return JSON.parse(cachedStr) as ICacheObject<T>;
    }
    
    private SetCacheObject<T>(key: string, data: T) {
        var cacheObj = JSON.stringify({
            data,
            created: new Date(Date.now()).toUTCString()
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
    async ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number = 0): Promise<T> {
        var module = key.split('.')[0];
        var timestampPromise = this.timestamps.Get(module);
        var cacheObj = this.GetCacheObject(key);
        if (!this.forceNoCache && cacheObj && cacheObj.created && cacheObj.data) {                        
            var now = new Date(Date.now());
            var created = new Date(cacheObj.created);
            var expires = new Date(created.getTime() + expiresInMilliseconds);
            if (expires <= now
            || created.getTime() < await timestampPromise) {                   
                return this.GetPageViewCachedResult<T>(key, func, expiresInMilliseconds, refreshInMilliseconds);
            }
            var refreshTime = new Date(created.getTime() + refreshInMilliseconds);
            if (refreshTime < now) {
                this.pageViewCache.ExecuteCached(key+"Refresh", () => {
                    setTimeout(() => {
                        this.GetPageViewCachedResult<T>(key, func, expiresInMilliseconds, refreshInMilliseconds);
                    }, refreshDelayInMilliseconds);
                }, refreshInMilliseconds);
            }

            return Promise.resolve(cacheObj.data as T);
        }
        else {
            return this.GetPageViewCachedResult<T>(key, func, expiresInMilliseconds, refreshInMilliseconds);
        }
    }

    private GetPageViewCachedResult<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number): Promise<T> {
        return this.pageViewCache.ExecuteCached<Promise<T>>(key, func, Math.min(expiresInMilliseconds, refreshInMilliseconds)).then(result => {
            this.SetCacheObject(key, result);
            return result;
        });
    }
}