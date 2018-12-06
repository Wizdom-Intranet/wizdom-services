import { WizdomTranslationService } from "../translation.service";
import { WizdomTranslationServiceFactory } from "../translation.service.factory";
import { IWizdomCache, IWizdomLocalstorageCache } from "../../caching/cache.interfaces";
import { IHttpClient, IHttpClientResponse } from "../../../shared/httpclient.wrappers/http.interfaces";
import { TranslationsTestData } from "./translation.faketext";
import { IWizdomContext } from "../../context/context.interfaces";

describe("WizdomTranslationServiceFactory", () => {
        
    var testHttpClient;
    var httpClientGetMock;
    var testCache;
    var executeCachedMock;
    var testWizdomContext;       
    beforeEach(() => {
        // mock HttpClient
        httpClientGetMock = jest.fn((url: string) => {
            return {
                ok: url.indexOf("xx-xx")==-1,
                text: jest.fn(() => {
                    return new Promise((resolve) => {
                        resolve(TranslationsTestData.CreateTranslationResponse("en-us", 
                            {'toBeTranslated':'tranlatedValue'}
                        ));
                    })
                }),
                json: jest.fn()
            } as IHttpClientResponse;
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
                Get: (key) => Promise.resolve("fakeTimeStamp"+key)
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

    it("should return an instance of WizdomTranslationService", async () => {
        var sut = new WizdomTranslationServiceFactory(testHttpClient, testWizdomContext, testCache);
        
        var translationService = await sut.CreateAsync("en-us");

        expect(translationService).not.toBeUndefined();        
        expect(translationService).toBeInstanceOf(WizdomTranslationService);        
    });

    it("should translate successfully", async () => {
        var sut = new WizdomTranslationServiceFactory(testHttpClient, testWizdomContext, testCache);
        
        var translationService = await sut.CreateAsync("en-us");        

        expect(translationService.translate('toBeTranslated')).toEqual('tranlatedValue');        
    });

    it("should cache on both appurl and language", async () => {
        testWizdomContext.appUrl = "https://testappurl";                
        var sut = new WizdomTranslationServiceFactory(testHttpClient, testWizdomContext, testCache);
        
        await sut.CreateAsync("da-dk");        
        
        expect(executeCachedMock.mock.calls[0][0]).toBe("Translation:https://testappurl.da-dk");
    });

    it("should request language specific translationsfile from blob", async () => {
        testWizdomContext.blobUrl = "https://testbloburl/";        
        var sut = new WizdomTranslationServiceFactory(testHttpClient, testWizdomContext, testCache);
        
        await sut.CreateAsync("da-dk");        
        expect(httpClientGetMock).toHaveBeenCalledTimes(1);
        expect(httpClientGetMock.mock.calls[0][0]).toBe("https://testbloburl/Base/Bundles/translations-da-dk.js?timestamp=fakeTimeStampTranslation");
    });   
    
    it("should request en-us if current language fails", async () => {
        testWizdomContext.blobUrl = "https://testbloburl/";        
        var sut = new WizdomTranslationServiceFactory(testHttpClient, testWizdomContext, testCache);
        
        await sut.CreateAsync("xx-xx");        
        expect(httpClientGetMock).toHaveBeenCalledTimes(2);
        expect(httpClientGetMock.mock.calls[0][0]).toBe("https://testbloburl/Base/Bundles/translations-xx-xx.js?timestamp=fakeTimeStampTranslation");
        expect(httpClientGetMock.mock.calls[1][0]).toBe("https://testbloburl/Base/Bundles/translations-en-us.js?timestamp=fakeTimeStampTranslation");
    });   
});