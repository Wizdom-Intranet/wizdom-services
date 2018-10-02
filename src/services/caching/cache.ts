import { IWizdomCache, IWizdomLocalstorageCache, IWizdomPageViewCache } from "./cache.interfaces";
import { WizdomPageViewCache } from "./cache.pageview";
import { WizdomLocalStorageCache } from "./cache.localstorage";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";
import { ILocationWrapper } from "../../shared/location.wrapper";

export class WizdomCache implements IWizdomCache {
    public Localstorage: IWizdomLocalstorageCache;
    public PageView: IWizdomPageViewCache;
  
    constructor(wizdomDeveloperMode: IWizdomDeveloperMode, locationWrapper: ILocationWrapper) {
        var forceNoCache = (locationWrapper && locationWrapper.GetQueryString("nocache") == "true") || (wizdomDeveloperMode && wizdomDeveloperMode.nocache)
        this.PageView = new WizdomPageViewCache(forceNoCache);
        this.Localstorage = new WizdomLocalStorageCache(this.PageView, forceNoCache);
    }
}