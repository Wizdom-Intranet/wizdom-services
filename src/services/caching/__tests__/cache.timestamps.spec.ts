import { WizdomCache } from "../cache";
import { IWizdomTimestamps, IWizdomTimestampsResolver } from "../cache.interfaces";
import { IHttpClient, IHttpClientResponse } from "../../../shared/httpclient.wrappers/http.interfaces";

describe("TimeStamps", () => {
  var timestamps: IWizdomTimestamps;
  var timestampResolver : IWizdomTimestampsResolver;
  var spHttpClientFake: IHttpClient;
  var spHttpClientFakeResolver: (any) => void;
  var wizdomCache: WizdomCache;
  beforeEach(() => {
    spHttpClientFake = {
      get: jest.fn(url => {
        return new Promise<IHttpClientResponse>((resolve, reject) => {
          spHttpClientFakeResolver = json => {
            let response: IHttpClientResponse = {
              ok: true,
              text: null,
              json() {
                return Promise.resolve(json);
              }
            };
            resolve(response);
          };
        });
      })
    };
    let developermode = null;
    let locationWrapper = null;
    wizdomCache = new WizdomCache(
      developermode,
      locationWrapper,
      spHttpClientFake,
      "https://myTenant/sites/test"
    );
    wizdomCache.resetPage();
    timestamps = wizdomCache.Timestamps;
    timestampResolver = wizdomCache.TimestampsResolver;
  });

  it("should return timestamps after load of Tenant Properties", async () => {
    let promise = timestamps.Get("timestampTest");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400000 }' });
    expect(await promise).toEqual(1545674400000);
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    expect(spHttpClientFake.get).toHaveBeenCalledWith("https://myTenant/sites/test/_api/web/GetStorageEntity('wizdom.timestamps')");
  });
  it("should be able to handle sites ending with /", async () => {
    wizdomCache = new WizdomCache(
      null,
      null,
      spHttpClientFake,
      "https://myTenant/"
    );
    timestamps = wizdomCache.Timestamps;
    let promise = timestamps.Get("timestampTest");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400000 }' });
    expect(await promise).toEqual(1545674400000);
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    expect(spHttpClientFake.get).toHaveBeenCalledWith("https://myTenant/_api/web/GetStorageEntity('wizdom.timestamps')");
  });
  it("should return Now when forceNoCache", async () => {
    wizdomCache = new WizdomCache(
      <any>{
        nocache: true
      },
      null,
      spHttpClientFake,
      "https://myTenant/"
    );
    let before = new Date().getTime();
    timestamps = wizdomCache.Timestamps;
    let promise = timestamps.Get("timestampTest");
    let timestamp = await promise;
    let after = new Date().getTime();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
  it("should only call spHttpClient once", async () => {
    let promise = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    let promise2 = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400001 }' });
    let promise3 = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    expect(await promise).toEqual(1545674400001);
    expect(await promise2).toEqual(1545674400001);
    expect(await promise3).toEqual(1545674400001);
  });
  it("should only make new call to spHttpClient after navigation", async () => {
    let promise = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    let promise2 = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(1);
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400003 }' });
    wizdomCache.resetPage();
    let promise3 = timestamps.Get("timestampTest");
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(2);
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400004 }' });
    expect(await promise).toEqual(1545674400003);
    expect(await promise2).toEqual(1545674400003);
    expect(await promise3).toEqual(1545674400004);
  });
  it("should return 0 if timed out (2 seconds)", async () => {
    jest.useFakeTimers();
    let promise = timestamps.Get("timestampTest");
    jest.advanceTimersByTime(2001);
    expect(await promise).toEqual(0);
  });
  it("should be able to get without 'timestamp' prefix", async () => {
    let promise = timestamps.Get("Test");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400005 }' });
    expect(await promise).toEqual(1545674400005);
  });
  it("should be able to get handle different casing", async () => {
    let promise = timestamps.Get("tEsT");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400006 }' });
    expect(await promise).toEqual(1545674400006);
  });
  it("should be able to get handle mappings", async () => {
    timestamps.AddMappings("test2", "test");
    let promise = timestamps.Get("Test2");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400007 }' });
    expect(await promise).toEqual(1545674400007);
  });
  it("should be returning highest if multiple mappings match", async () => {
    timestamps.AddMappings("test2", "test", "testing");
    let promise = timestamps.Get("Test2");
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400008, "timestampTesting": 1545674400009 }' });
    expect(await promise).toEqual(1545674400009);
  });
  it("should be using Configuration as default mapping", async () => {
    timestamps.AddMappings("test2", "test", "testing");
    let promise = timestamps.Get("Test2");
    let promise2 = timestamps.Get("NonExisting");
    let promise3 = timestamps.Get();
    spHttpClientFakeResolver({ Value: '{ "timestampConfiguration": 1545674400012, "timestampTest": 1545674400010, "timestampTesting": 1545674400011 }' });
    expect(await promise).toEqual(1545674400012);
    expect(await promise2).toEqual(1545674400012);
    expect(await promise3).toEqual(1545674400012);
  });
  it("should allow external resolve", async () => {
    let promise = timestamps.Get("timestampTest");
    timestampResolver.Resolve({ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400014 });
    expect(await promise).toEqual(1545674400014);
  });
  it("should not call spHttpClient if already externally resolved", async () => {
    timestampResolver.Resolve({ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400015 });
    let promise = timestamps.Get("timestampTest");
    expect(await promise).toEqual(1545674400015);
    expect(spHttpClientFake.get).toHaveBeenCalledTimes(0);
  });
  it("should only use first resolve", async () => {
    let promise = timestamps.Get("timestampTest");
    timestampResolver.Resolve({ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400016 });
    timestampResolver.Resolve({ "timestampConfiguration": 1545674400000, "timestampTest": 1545674400017 });
    expect(await promise).toEqual(1545674400016);
  });

});
