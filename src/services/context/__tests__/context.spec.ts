import { IWizdomCache, IWizdomLocalstorageCache } from "../../caching/cache.interfaces";
import { IHttpClient, IHttpClientResponse } from "../../../shared/httpclient.wrappers/http.interfaces";
import { WizdomContextFactory } from "../context.factory";
describe("WizdomContext", () => {

    function getCacheMock(){
        var executeCachedMock = jest.fn((key: string, func: Function) => {
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
        return new CacheMock();
    }
    function getSpHttpClient(mockData){
        var httpClientGetMock = function(url: string) {
            return Promise.resolve({
                ok: true,
                text: jest.fn(),
                json: ()=> {
                    if(url.indexOf("GetStorageEntity")>0) // request for tenant properties
                        return Promise.resolve(mockData.tenantProperties || {});
                    else if(url.indexOf("AllProperties")>0) // request for site properties
                        return Promise.resolve(mockData.siteProperties || {});
                    return null; // ignore all other requests
                },
            } as IHttpClientResponse);
        };
        const HttpClientMockImplementation = jest.fn<IHttpClient>(() => ({
            get: httpClientGetMock            
        }));
        return new HttpClientMockImplementation();
    }


    it("should return context info from site properties, if defined in both tenant and site", async () => {
        var mockData = { 
            tenantProperties:{ 
                Value : JSON.stringify({
                    blobUrl : "http://blob/tenant/",
                    appUrl : "http://app/tenant/",
                    clientId : "client-id-tenant"
                })
            },
            siteProperties:{
                wizdom_x002e_properties : JSON.stringify({
                    blobUrl : "http://blob/site/",
                    appUrl : "http://app/site/",
                    clientId : "client-id-site"
                })
            }
        }
        var sut = new WizdomContextFactory(getSpHttpClient(mockData), getCacheMock(), null);
        var context = await sut.GetWizdomContextAsync("http://sharepoint.site/absolute/url/");
        expect(context.blobUrl).toEqual("http://blob/site/");
        expect(context.appUrl).toEqual("http://app/site/");
        expect(context.clientId).toEqual("client-id-site");
    });
    it("should return context info from tenant properties, if not defined in site properties", async () => {
        var mockData = { 
            tenantProperties:{ 
                Value : JSON.stringify({
                    blobUrl : "http://blob/tenant/",
                    appUrl : "http://app/tenant/",
                    clientId : "client-id-tenant"
                })
            },
            siteProperties:{}
        }
        var sut = new WizdomContextFactory(getSpHttpClient(mockData), getCacheMock(), null);
        var context = await sut.GetWizdomContextAsync("http://sharepoint.site/absolute/url/");
        expect(context.blobUrl).toEqual("http://blob/tenant/");
        expect(context.appUrl).toEqual("http://app/tenant/");
        expect(context.clientId).toEqual("client-id-tenant");
    });
    it("should return context info from site properties, if only defined in site properties", async () => {
        var mockData = { 
            tenantProperties:{},
            siteProperties:{
                wizdom_x002e_properties : JSON.stringify({
                    blobUrl : "http://blob/site/",
                    appUrl : "http://app/site/",
                    clientId : "client-id-site"
                })
            }
        }
        var sut = new WizdomContextFactory(getSpHttpClient(mockData), getCacheMock(), null);
        var context = await sut.GetWizdomContextAsync("http://sharepoint.site/absolute/url/");
        expect(context.blobUrl).toEqual("http://blob/site/");
        expect(context.appUrl).toEqual("http://app/site/");
        expect(context.clientId).toEqual("client-id-site");
    });
    it("should be possible to owerwrite only selected tenant properties from site properties", async () => {
        var mockData = { 
            tenantProperties:{ 
                Value : JSON.stringify({
                    blobUrl : "http://blob/tenant/",
                    appUrl : "http://app/tenant/",
                    clientId : "client-id-tenant"
                })
            },
            siteProperties:{
                wizdom_x002e_properties : JSON.stringify({
                    blobUrl : "http://blob/site/",
                    appUrl : "http://app/site/",
                    // use clientId from tenant
                })
            }
        }
        var sut = new WizdomContextFactory(getSpHttpClient(mockData), getCacheMock(), null);
        var context = await sut.GetWizdomContextAsync("http://sharepoint.site/absolute/url/");
        expect(context.blobUrl).toEqual("http://blob/site/");
        expect(context.appUrl).toEqual("http://app/site/");
        expect(context.clientId).toEqual("client-id-tenant");
    });
});