import { IWizdomLocalstorageCache, IWizdomCache } from "../services/caching/cache.interfaces";
import { WizdomLanguageUpdate } from "../services/wizdom.language.update";
import { IHttpClientResponse, IHttpClient } from "../shared/httpclient.wrappers/http.interfaces";
import { IWizdomWebApiService } from "../services/webapi/webapi.interfaces";

describe("WizdomLanguageUpdate", () => {
    var fakeSpUrl = "http://sharepointHostUrl.com";

    // Mock Caching    
    var mockCache = jest.fn(() => ({
        Localstorage: jest.fn(() => ({
            ExecuteCached: jest.fn((key: string, func: Function) => {
                return func();
            })
        }) as IWizdomLocalstorageCache)(),
        Timestamps: {
            Get: (key) => Promise.resolve(42)
        }
    }) as IWizdomCache)();

    // Fake SpHttpClient
    function getFakeSpHttpClient(mockData) {
        var httpClientGetMock = function (url: string) {
            return Promise.resolve({
                ok: true,
                text: jest.fn(),
                json: () => {
                    if (url.indexOf("_api/SP.UserProfiles.PeopleManager/GetMyProperties") > 0) // request for tenant properties
                        return Promise.resolve(mockData);
                    return null; // ignore all other requests
                },
            } as IHttpClientResponse);
        };
        const HttpClientMockImplementation = jest.fn<IHttpClient, any>(() => ({
            get: httpClientGetMock
        }));
        return new HttpClientMockImplementation();
    }

    // Fake WebApiService
    var mockWebApiService;
    beforeEach(() => {
        mockWebApiService = {
            Get: jest.fn(),
            Delete: jest.fn(),
            Post: jest.fn(),
            Put: jest.fn()
        } as IWizdomWebApiService;
    });

    var oldWizdomLanguage = "en-us";

    var fakeConfig = {
        Wizdom365: {
            Languages: [{ Tag: "da-dk" }, { Tag: "en-us" }]
        }
    }

    it("should update language if wizdom language and preferred language are different", async () => {
        var wizdomLanguageUpdate = new WizdomLanguageUpdate(getFakeSpHttpClient({
            UserProfileProperties: [{ "Key": "SPS-MUILanguages", "Value": "da-dk,en-us" }]
        }), mockWebApiService, mockCache);

        await wizdomLanguageUpdate.UpdateIfNeededAsync(fakeSpUrl, oldWizdomLanguage, fakeConfig);

        expect(mockWebApiService.Put).toHaveBeenCalledTimes(1);
        expect(mockWebApiService.Put).toHaveBeenCalledWith("api/wizdom/365/principals/me/language", "da-dk");
    });

    it("should NOT update language if wizdom language and preferred language are the same", async () => {
        var wizdomLanguageUpdate = new WizdomLanguageUpdate(getFakeSpHttpClient({
            UserProfileProperties: [{ "Key": "SPS-MUILanguages", "Value": "en-us,da-dk" }]
        }), mockWebApiService, mockCache);

        await wizdomLanguageUpdate.UpdateIfNeededAsync(fakeSpUrl, oldWizdomLanguage, fakeConfig);

        expect(mockWebApiService.Put).toHaveBeenCalledTimes(0);
    });

    it("should NOT update language if preferred language is not an active wizdom language", async () => {
        var wizdomLanguageUpdate = new WizdomLanguageUpdate(getFakeSpHttpClient({
            UserProfileProperties: [{ "Key": "SPS-MUILanguages", "Value": "de-de" }]
        }), mockWebApiService, mockCache);

        await wizdomLanguageUpdate.UpdateIfNeededAsync(fakeSpUrl, oldWizdomLanguage, fakeConfig);

        expect(mockWebApiService.Put).toHaveBeenCalledTimes(0);
    });
});
