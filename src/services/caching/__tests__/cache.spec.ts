import { WizdomCache } from "../cache";
import { WizdomLocalStorageCache } from "../cache.localstorage";
import { WizdomPageViewCache } from "../cache.pageview";

describe("WizdomCache", () => {    
    var developermode;
    var locationWrapper;
    beforeEach(() => {                
        developermode = null;
        locationWrapper = null;
    });

    it("should initialize default cache instances", () => {
        var wizdomCache = new WizdomCache(developermode, locationWrapper);

        expect(wizdomCache.Localstorage).toBeInstanceOf(WizdomLocalStorageCache);
        expect(wizdomCache.PageView).toBeInstanceOf(WizdomPageViewCache);
    });
});