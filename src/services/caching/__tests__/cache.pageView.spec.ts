import { IWizdomDeveloperMode } from "../../../shared/developermode.interface";
import { WizdomCache } from "../cache";
import { ILocationWrapper } from "../../../shared/location.wrapper";
import { IWizdomPageViewCache } from "../cache.interfaces";

describe("PageViewCache", () => {    
    var developermode;
    var locationWrapper;
    beforeEach(() => {                
        developermode = null;
        locationWrapper = null;        
    });
    
    function SetGlobalDateNow(time: number) { // method to control Date.now()                         
        global["Date"].now = jest.fn(() => time);
    }

    it("should return cached result", () => {
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var pageViewCache = wizdomCache.PageView as IWizdomPageViewCache;
        
        var functionMock = jest.fn();
        functionMock.mockReturnValue(42);
        var result = pageViewCache.ExecuteCached("test result", functionMock, 5000);
        expect(result).toBe(42);        

        functionMock.mockReturnValue(43); // Update function result
        result = pageViewCache.ExecuteCached("test result", functionMock, 5000);
        expect(result).toBe(42); // Expect cached result
    });

    it("should only invoke method again after expiration period", () => {                        
        var dateToUse = new Date('2018');
        SetGlobalDateNow(dateToUse.getTime());

        var functionMock = jest.fn();
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var pageViewCache = wizdomCache.PageView as IWizdomPageViewCache;
        
        pageViewCache.ExecuteCached("test expiration", functionMock, 5000);
        pageViewCache.ExecuteCached("test expiration", functionMock, 5000);
        expect(functionMock).toHaveBeenCalledTimes(1);  // Still only 1 execution

        SetGlobalDateNow(dateToUse.getTime() + 4999); // advance Date.now() to just before expiration
        pageViewCache.ExecuteCached("test expiration", functionMock, 5000);
        expect(functionMock).toHaveBeenCalledTimes(1);  // Still only 1 execution
        
        SetGlobalDateNow(dateToUse.getTime() + 5000); // Advance Date.now() to right after expiration
        pageViewCache.ExecuteCached("test expiration", functionMock, 5000);        
        expect(functionMock).toHaveBeenCalledTimes(2); // Now 2 executions
    });

    it("should force method invokation immediatly in nocache developermode", () => {        
        developermode = {
            nocache: true
        } as IWizdomDeveloperMode;
        testNoCacheUsingCacheKey("test nocache developermode");
    });

    it("should force method invokation immediatly in nocache querystring mode", () => {        
        locationWrapper = {
            GetQueryString: jest.fn(() => { return "true"; })
        } as ILocationWrapper;
        testNoCacheUsingCacheKey("test nocache querystring");
    });

    function testNoCacheUsingCacheKey(cacheKey: string){
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var pageViewCache = wizdomCache.PageView as IWizdomPageViewCache;
        
        var functionMock = jest.fn();
        functionMock.mockReturnValue(42);
        var result = pageViewCache.ExecuteCached(cacheKey, functionMock, 5000);
        expect(result).toBe(42);        
                
        functionMock.mockReturnValue(43); // Update function result
        var result = pageViewCache.ExecuteCached(cacheKey, functionMock, 5000);
        expect(result).toBe(43); // Expect cached result

        expect(functionMock).toHaveBeenCalledTimes(2);
    }
    
    it("should update cache on each nocache execution", () => {
        developermode = {
            nocache: true
        } as IWizdomDeveloperMode;
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var pageViewCache = wizdomCache.PageView as IWizdomPageViewCache;

        var functionMock = jest.fn();
        functionMock.mockReturnValue(42);

        expect(window["WizdomPageViewCache"]["testcacheupdate"]).toBeUndefined();

        pageViewCache.ExecuteCached("test cacheupdate", functionMock, 5000);
        expect(window["WizdomPageViewCache"]["testcacheupdate"]).toHaveProperty("data", 42);

        functionMock.mockReturnValue(43); // Update function result
        pageViewCache.ExecuteCached("test cacheupdate", functionMock, 5000);
        expect(window["WizdomPageViewCache"]["testcacheupdate"]).toHaveProperty("data", 43); // Validate updated data in cache
    });
});