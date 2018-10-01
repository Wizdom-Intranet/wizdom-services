import { IWizdomCache, IWizdomLocalstorageCache, IWizdomPageViewCache } from "./cache.interfaces";
import { WizdomPageViewCache } from "./cache.pageview";
import { WizdomLocalStorageCache } from "./cache.localstorage";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";
import { WizdomPageViewNoCache } from "./cache.pageview.nocache";
import { WizdomLocalStorageNoCache } from "./cache.localstorage.nocache";
import { ILocationWrapper } from "../../shared/location.wrapper";

export class WizdomCache implements IWizdomCache {
    Localstorage: IWizdomLocalstorageCache;
    PageView: IWizdomPageViewCache;
  
    constructor(wizdomDeveloperMode: IWizdomDeveloperMode, locationWrapper: ILocationWrapper) {
        if((locationWrapper && locationWrapper.GetQueryString("nocache") == "true") || (wizdomDeveloperMode && wizdomDeveloperMode.nocache)){
            this.PageView = new WizdomPageViewNoCache();
            this.Localstorage = new WizdomLocalStorageNoCache();
        }
        else {
            this.PageView = new WizdomPageViewCache();
            this.Localstorage = new WizdomLocalStorageCache(this.PageView);        
        }
    }
}