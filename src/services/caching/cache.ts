import { IWizdomCache, IWizdomLocalstorageCache, IWizdomPageViewCache, IWizdomTimestamps, IWizdomTimestampsResolver } from "./cache.interfaces";
import { WizdomPageViewCache } from "./cache.pageview";
import { WizdomLocalStorageCache } from "./cache.localstorage";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";
import { ILocationWrapper } from "../../shared/location.wrapper";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";
import { WizdomTimestamps } from "./cache.timestamps";

export class WizdomCache implements IWizdomCache {
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    public Localstorage: IWizdomLocalstorageCache;
    public PageView: IWizdomPageViewCache;
    public Timestamps: IWizdomTimestamps;
    public TimestampsResolver: IWizdomTimestampsResolver;
  
    constructor(wizdomDeveloperMode: IWizdomDeveloperMode, locationWrapper: ILocationWrapper, spHttpClient?: IHttpClient, absoluteUrl?: string) {
        var forceNoCache = (locationWrapper && locationWrapper.GetQueryString("nocache") == "true") || (wizdomDeveloperMode && wizdomDeveloperMode.nocache)
        this.PageView = new WizdomPageViewCache(this, forceNoCache);
        this.Localstorage = new WizdomLocalStorageCache(this.PageView, forceNoCache);
        var timestamps  = new WizdomTimestamps(this, forceNoCache, spHttpClient, absoluteUrl);
        this.Timestamps = timestamps;
        this.TimestampsResolver = timestamps;
    }

    private static globalCacheVariable = "WizdomCache";
    public resetPage() {
        window[WizdomCache.globalCacheVariable] = null;
    }
    public getGlobalVariable() {
        if(window[WizdomCache.globalCacheVariable] == null) {
            window[WizdomCache.globalCacheVariable] = {};
        }
        return window[WizdomCache.globalCacheVariable];
    }
}