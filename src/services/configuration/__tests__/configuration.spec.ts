import { IWizdomCache, IWizdomLocalstorageCache } from "../../caching/cache.interfaces";
import { IHttpClient, IHttpClientResponse } from "../../../shared/httpclient.wrappers/http.interfaces";
import { IWizdomContext } from "../../context/context.interfaces";
import { GetWizdomConfiguration } from "../configuration";

describe("WizdomConfiguration", () => {
        
    var testHttpClient;
    var httpClientGetMock;
    var testCache;
    var executeCachedMock;
    var testWizdomContext;       
    beforeEach(() => {
        // mock HttpClient
        httpClientGetMock = jest.fn((url: string) => {
            return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(`\x0avar Wizdom365Config={"Test":"Hello World"};var Wizdom365AppUrl='https://localhost:44371/'`),
                json: jest.fn()
            } as IHttpClientResponse);
        });
        const HttpClientMockImplementation = jest.fn<IHttpClient>(() => ({
            get: httpClientGetMock            
        }));
        testHttpClient = new HttpClientMockImplementation();

        // mock Caching
        executeCachedMock = jest.fn((key: string, func: Function) => {
            return func();
        })
        const LocalStorageCacheMock = jest.fn<IWizdomLocalstorageCache>(() => ({            
            ExecuteCached: executeCachedMock
        }));
        const CacheMock = jest.fn<IWizdomCache>(() => ({
            Localstorage: new LocalStorageCacheMock(),
            Timestamps: {
                Get: (key) => "fakeTimeStamp"+key
            }
        })); 
        testCache = new CacheMock();

        // mock Context
        testWizdomContext = {
            appUrl: "",
            blobUrl: "",
            clientId: "",
            wizdomdevelopermode: false
        } as IWizdomContext;
    });

    it("should return configuration as object", async () => {
        testWizdomContext.blobUrl = "https://testbloburl/";
        var sut = GetWizdomConfiguration(testHttpClient, testWizdomContext, testCache);

        var result = await sut;
        expect(result).toEqual({Test:"Hello World"});
    });   

    it("should request configuration from blob", async () => {
        testWizdomContext.blobUrl = "https://testbloburl/";
        var sut = GetWizdomConfiguration(testHttpClient, testWizdomContext, testCache);

        await sut;
        expect(httpClientGetMock).toHaveBeenCalledTimes(1);
        expect(httpClientGetMock.mock.calls[0][0]).toBe("https://testbloburl/Base/Bundles/configuration.js?timestamp=fakeTimeStampConfiguration");
    });   
});