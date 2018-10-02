import { WizdomCache } from "../cache";
import { IWizdomLocalstorageCache } from "../cache.interfaces";
import LocalStorageFake from "./localStorage.fake";
import { IWizdomDeveloperMode } from "../../../shared/developermode.interface";
import { ILocationWrapper } from "../../../shared/location.wrapper";

describe("LocalStorageCache", () => {    

    // When running in VSCode debugger the window object do not exists    
    if(global["window"] == null)
        global["window"] = {};

    // When running in VSCode debugger localstorage do not exists
    var localstorageFake = new LocalStorageFake();
        Object.defineProperty(window, 'localStorage', {
            value: localstorageFake
        });

    var developermode;
    var locationWrapper;
    var functionMock;
    beforeEach(() => {                
        developermode = null;
        locationWrapper = null;
        functionMock = jest.fn(() => { 
            return new Promise(resolve => {                                
                resolve({});
            });
        });  
    });
    
    function SetGlobalDateNow(time: number) { // method to control Date.now()   
        global["Date"].now = jest.fn(() => time);
    }

    it("should only invoke method again after expiration period", async () => {      
        var dateToUse = new Date('2018');
        SetGlobalDateNow(dateToUse.getTime());                     
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var LocalStorageCache = (wizdomCache.Localstorage as IWizdomLocalstorageCache);

        await LocalStorageCache.ExecuteCached("test expiration", functionMock, 5000, 9999, 9999);
        await LocalStorageCache.ExecuteCached("test expiration", functionMock, 5000, 9999, 9999);        
        expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution
        
        SetGlobalDateNow(dateToUse.getTime() + 4999); // Advance Date.now() to just before expiration
        await LocalStorageCache.ExecuteCached("test expiration", functionMock, 5000, 9999, 9999);        
        expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

        SetGlobalDateNow(dateToUse.getTime() + 5000); // Advance Date.now() right after expiration
        await LocalStorageCache.ExecuteCached("test expiration", functionMock, 5000, 9999, 9999);
        expect(functionMock).toHaveBeenCalledTimes(2); // Now 2 execution
    });

    it("should invoke method delayed after refresh period", async () => {  
        jest.useFakeTimers();    
        var dateToUse = new Date('2018');
        SetGlobalDateNow(dateToUse.getTime());
                
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var LocalStorageCache = (wizdomCache.Localstorage as IWizdomLocalstorageCache);

        await LocalStorageCache.ExecuteCached("test delayed refesh", functionMock, 9999, 1000, 1000);
        await LocalStorageCache.ExecuteCached("test delayed refesh", functionMock, 9999, 1000, 1000);
        expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution
        
        SetGlobalDateNow(dateToUse.getTime() + 1001); // Advance time to later than refresh time
        
        await LocalStorageCache.ExecuteCached("test delayed refesh", functionMock, 9999, 1000, 1000); // Execute again to start delayed refesh
        jest.advanceTimersByTime(999); // Advance timer almost until just before delayed refresh
        expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

        jest.advanceTimersByTime(1); // Advance timer to right after delayed refresh execution
        expect(functionMock).toHaveBeenCalledTimes(2); // Now 2 executions
    });

    it("should force method invokation immediatly in nocache developermode", async () => {                
        developermode = {
            nocache: true
        } as IWizdomDeveloperMode;
        await testNoCacheUsingCacheKey("test nocache developermode"); 
    });
    
    it("should force method invokation immediatly in nocache querystring", async () => {                
        locationWrapper = {
            GetQueryString: jest.fn(() => { return "true"; })
        } as ILocationWrapper;
        await testNoCacheUsingCacheKey("test nocache querystring");       
    });

    async function testNoCacheUsingCacheKey(cacheKey: string) {
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var LocalStorageCache = (wizdomCache.Localstorage as IWizdomLocalstorageCache);
                         
        functionMock = jest.fn(() => { 
            return new Promise(resolve => {
                resolve({ answer: "42" });
            });
        });  
        var result = await LocalStorageCache.ExecuteCached(cacheKey, functionMock, 9999, 9999, 9999);
        expect(result).toMatchObject({ answer: "42" });
        
        functionMock = jest.fn(() => { 
            return new Promise(resolve => {
                resolve({ answer: "43" });
            });
        });  
        result = await LocalStorageCache.ExecuteCached(cacheKey, functionMock, 9999, 9999, 9999);
        expect(result).toMatchObject({ answer: "43" });

        expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution
    }

    it("should update cache on each nocache execution", async () => {
        developermode = {
            nocache: true
        } as IWizdomDeveloperMode;
        var wizdomCache = new WizdomCache(developermode, locationWrapper);
        var LocalStorageCache = (wizdomCache.Localstorage as IWizdomLocalstorageCache);

        functionMock = jest.fn(() => {
            return new Promise(resolve => {
                resolve({ answer: "42" });
            });
        });
        await LocalStorageCache.ExecuteCached("test cache update", functionMock, 9999, 9999, 9999);        
        var result = localstorageFake.getItemContainingKey("test cache update");        
        expect(JSON.parse(result)).toHaveProperty("data", { answer: "42" });
        
        functionMock = jest.fn(() => { 
            return new Promise(resolve => {
                resolve({ answer: "43" });
            });
        });
        await LocalStorageCache.ExecuteCached("test cache update", functionMock, 9999, 9999, 9999);        
        var result = localstorageFake.getItemContainingKey("test cache update");        
        expect(JSON.parse(result)).toHaveProperty("data", { answer: "43" }); // Validate updated cache
    });

});