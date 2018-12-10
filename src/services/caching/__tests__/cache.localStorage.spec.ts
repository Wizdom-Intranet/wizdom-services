import { WizdomCache } from "../cache";
import { IWizdomLocalstorageCache } from "../cache.interfaces";
import LocalStorageFake from "./localStorage.fake";
import { ILocationWrapper } from "../../../shared/location.wrapper";

describe("LocalStorageCache", () => {
  // When running in VSCode debugger localstorage do not exists
  var localstorageFake = new LocalStorageFake();
  Object.defineProperty(window, "localStorage", {
    value: localstorageFake
  });
  var wizdomCache: WizdomCache;
  var LocalStorageCache: IWizdomLocalstorageCache;
  function initialize(developermode = null, locationWrapper: ILocationWrapper = null) {
    wizdomCache = new WizdomCache(developermode, locationWrapper);
    wizdomCache.resetPage();
    LocalStorageCache = wizdomCache.Localstorage;
    wizdomCache.Timestamps.Get = jest.fn(_ => {
      return Promise.resolve(0);
    });
  }
  var dateToUse: Date;
  var functionMock;
  beforeEach(() => {
    jest.useRealTimers();
    localstorageFake.clear();
    functionMock = jest.fn(() => {
      return new Promise(resolve => {
        resolve({});
      });
    });
    dateToUse = new Date("2018");
    SetGlobalDateNow(dateToUse.getTime());
    initialize();
  });

  function SetGlobalDateNow(time: number) {
    // method to control Date.now()
    global["Date"].now = () => time;
  }

  it("should only invoke method again after expiration period", async () => {
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
    initialize({ nocache: true });
    await testNoCacheUsingCacheKey("test nocache developermode");
  });

  it("should force method invokation immediatly in nocache querystring", async () => {
    initialize(null, {
      GetQueryString: jest.fn(() => {
        return "true";
      })
    });
    await testNoCacheUsingCacheKey("test nocache querystring");
  });

  async function testNoCacheUsingCacheKey(cacheKey: string) {
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
    initialize({ nocache: true });

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

  it("should invoke method again if timestamp is after creation time", async () => {
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

    wizdomCache.resetPage();
    SetGlobalDateNow(dateToUse.getTime() + 200);
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

    wizdomCache.resetPage();
    wizdomCache.Timestamps.Get = jest.fn(_ => {
      return Promise.resolve(dateToUse.getTime() + 100);
    });
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(2); // Now 2 execution
  });

  it("should not need to wait for timestamp already expired", async () => {
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

    SetGlobalDateNow(dateToUse.getTime() + 200);
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

    wizdomCache.Timestamps.Get = jest.fn(_ => {
      return new Promise(_ => {});
    });
    SetGlobalDateNow(dateToUse.getTime() + 5000);
    await LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    expect(functionMock).toHaveBeenCalledTimes(2); // Now 2 execution
  });

  it("should only call function once even for multiple request while resolving", async () => {
    var resolver;
    functionMock = jest.fn(() => {
      return new Promise(resolve => {
        resolver = resolve;
      });
    });

    var promise1 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    var promise2 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    setTimeout(_ => {
      resolver(42);
    });
    expect(await promise1).toEqual(42);
    expect(await promise2).toEqual(42);
    expect(functionMock).toHaveBeenCalledTimes(1); // Still only 1 execution

    wizdomCache.resetPage();
    SetGlobalDateNow(dateToUse.getTime() + 5000);
    var promise3 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    var promise4 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    setTimeout(_ => {
      resolver(43);
    });
    expect(await promise3).toEqual(43);
    expect(await promise4).toEqual(43);
    expect(functionMock).toHaveBeenCalledTimes(2); // Expired by still only 2 executions

    wizdomCache.resetPage();
    SetGlobalDateNow(dateToUse.getTime() + 200);
    wizdomCache.Timestamps.Get = jest.fn(_ => {
      return Promise.resolve(dateToUse.getTime() + 5100);
    });
    var promise3 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    var promise4 = LocalStorageCache.ExecuteCached("test timestamp", functionMock, 5000, 9999, 9999);
    setTimeout(_ => {
      resolver(44);
    });
    expect(await promise3).toEqual(44);
    expect(await promise4).toEqual(44);
    expect(functionMock).toHaveBeenCalledTimes(3); // CacheBursted by still only 3 executions
  });
  it('should get timestamp for module', async () => {
    await LocalStorageCache.ExecuteCached("Module.Function", functionMock, 5000, 9999, 9999);
    expect(wizdomCache.Timestamps.Get).toHaveBeenCalledTimes(1);
    expect((<any>wizdomCache.Timestamps.Get).mock.calls[0][0]).toEqual("Module")
    await LocalStorageCache.ExecuteCached("Module.Function:Params", functionMock, 5000, 9999, 9999);
    expect(wizdomCache.Timestamps.Get).toHaveBeenCalledTimes(2);
    expect((<any>wizdomCache.Timestamps.Get).mock.calls[1][0]).toEqual("Module")
    await LocalStorageCache.ExecuteCached("Module:Params", functionMock, 5000, 9999, 9999);
    expect(wizdomCache.Timestamps.Get).toHaveBeenCalledTimes(3);
    expect((<any>wizdomCache.Timestamps.Get).mock.calls[2][0]).toEqual("Module")
  });
});
