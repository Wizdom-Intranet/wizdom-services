import { IWizdomCache, IWizdomLocalstorageCache, IWizdomPageViewCache } from "./cache.interfaces";
import { WizdomPageViewCache } from "./cache.pageview";
import { WizdomLocalStorageCache } from "./cache.localstorage";

export class WizdomCache implements IWizdomCache {
    Localstorage: IWizdomLocalstorageCache;
    PageView: IWizdomPageViewCache;
  
    constructor() {        
        this.Localstorage = new WizdomLocalStorageCache();
        this.PageView = new WizdomPageViewCache();
    }
}