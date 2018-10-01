import { IWizdomDeveloperMode } from "../../../shared/developermode.interface";
import { WizdomCache } from "../cache";
import { WizdomLocalStorageCache } from "../cache.localstorage";
import { WizdomPageViewCache } from "../cache.pageview";
import { WizdomLocalStorageNoCache } from "../cache.localstorage.nocache";
import { LocationWrapper, ILocationWrapper } from "../../../shared/location.wrapper";
import { WizdomPageViewNoCache } from "../cache.pageview.nocache";
//export default (location) => window.location = location;

describe("WizdomCache", () => {
    var sut;
    var developermode;
    var locationWrapper;
    beforeEach(() => {                
        developermode = null;
        locationWrapper = null;
    });

    it("should initialize default cache instances", () => {
        sut = new WizdomCache(developermode, locationWrapper);

        expect(sut.Localstorage).toBeInstanceOf(WizdomLocalStorageCache);
        expect(sut.PageView).toBeInstanceOf(WizdomPageViewCache);
    });

    it("nocache query should initialize no cache instances", () => {        
        locationWrapper = {
            GetQueryString: jest.fn(() => { return "true"; })
        } as ILocationWrapper;
        sut = new WizdomCache(developermode, locationWrapper);
        
        expect(sut.Localstorage).toBeInstanceOf(WizdomLocalStorageNoCache);
        expect(sut.PageView).toBeInstanceOf(WizdomPageViewNoCache);
    });

    it("nocache developermode should initialize no cache instances", () => {       
        developermode = { nocache: true } as IWizdomDeveloperMode;
        sut = new WizdomCache(developermode, locationWrapper);
        
        expect(sut.Localstorage).toBeInstanceOf(WizdomLocalStorageNoCache);
        expect(sut.PageView).toBeInstanceOf(WizdomPageViewNoCache);
    });
});