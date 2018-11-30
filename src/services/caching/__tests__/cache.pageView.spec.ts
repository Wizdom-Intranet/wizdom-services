import { IWizdomDeveloperMode } from "../../../shared/developermode.interface";
import { WizdomCache } from "../cache";
import { ILocationWrapper } from "../../../shared/location.wrapper";
import { IWizdomPageViewCache, IWizdomTimestamps } from "../cache.interfaces";

describe("PageViewCache", () => {    
    var wizdomCache : WizdomCache;
    var pageViewCache: IWizdomPageViewCache;
    function initialize(developermode=null, locationWrapper=null) {
        wizdomCache = new WizdomCache(developermode, locationWrapper);
        pageViewCache = wizdomCache.PageView as IWizdomPageViewCache;
    }
    beforeEach(() => {                
        initialize();
    });
    function SetGlobalDateNow(time: number) { // method to control Date.now()                         
        global["Date"].now = jest.fn(() => time);
    }

    it("should return cached result", () => {
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
        initialize({nocache:true});
        testNoCacheUsingCacheKey("test nocache developermode");
    });

    it("should force method invokation immediatly in nocache querystring mode", () => {        
        initialize(null, {
            GetQueryString: jest.fn(() => { return "true"; })
        });
        testNoCacheUsingCacheKey("test nocache querystring");
    });

    function testNoCacheUsingCacheKey(cacheKey: string){
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
        initialize({nocache:true});

        var functionMock = jest.fn();
        // First call with nocache should call function 
        functionMock.mockReturnValue(42);
        var result = pageViewCache.ExecuteCached("test cacheupdate", functionMock, 5000);
        expect(result).toEqual(42);
        expect(functionMock).toHaveBeenCalledTimes(1);

        // Second call with nocache should call function 
        functionMock.mockReturnValue(43); // Update function result
        var result = pageViewCache.ExecuteCached("test cacheupdate", functionMock, 5000);
        expect(result).toEqual(43); // Validate updated data in cache
        expect(functionMock).toHaveBeenCalledTimes(2);

        initialize();
        // First call without nocache should not call function 
        var result = pageViewCache.ExecuteCached("test cacheupdate", functionMock, 5000);
        expect(result).toEqual(43); // Validate updated data in cache
        expect(functionMock).toHaveBeenCalledTimes(2);

    });
});