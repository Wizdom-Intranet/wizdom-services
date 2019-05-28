import { IWizdomCache, IWizdomLocalstorageCache } from "../../caching/cache.interfaces";
import { IHttpClient, IHttpClientResponse } from "../../../shared/httpclient.wrappers/http.interfaces";
import { IWizdomContext } from "../../context/context.interfaces";
import { GetWizdomConfiguration } from "../configuration";

describe("WizdomConfiguration", () => {
        
    var testHttpClient;
    var httpClientGetMock;
    var testCache;
    var testWizdomContext; 

    // mock Caching
    testCache = jest.fn(() => ({
        Localstorage: jest.fn(() => ({            
            ExecuteCached: jest.fn((key: string, func: Function) => {
                return func();
            })
        }) as IWizdomLocalstorageCache)(),
        Timestamps: {
            Get: (key) => Promise.resolve(42)
        }
    }) as IWizdomCache)();

    var setTestConfiguration = (configuration: object) => {        
        // mock HttpClient
        httpClientGetMock = jest.fn((url: string) => {
            return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(`\x0avar Wizdom365Config=`+ JSON.stringify(configuration) +`;var Wizdom365AppUrl='https://localhost:44371/'`),
                json: jest.fn()
            } as IHttpClientResponse);
        });
        testHttpClient = jest.fn(() => ({
            get: httpClientGetMock            
        }) as IHttpClient)();
    };

    var setWindowLocationHref = (url:string) => {
        Object.defineProperty(window, "location", {
            value: {
                href: url
            },
            writable: true // Allow overwrite of window.location in multiple test
        });
    }

    var executeConfigurationRequest = async () => {
        return await GetWizdomConfiguration(testHttpClient, testWizdomContext, testCache)
    };

    beforeEach(() => {    
        // set text WizdomContext
        testWizdomContext = {
            appUrl: "",
            blobUrl: "",
            clientId: "",
            wizdomdevelopermode: false
        } as IWizdomContext;   
                
        // set test configuration
        setTestConfiguration({
            "TestModule": {
                "Value": "SingleConfigValue"
            },
            "TestModuleWithOneConfigFilters": [
                {
                    "Value": "OneConfigFilterValue"
                }        
            ],
            "TestModuleWithMultipleConfigFilters": [
                {
                    "Value": "DefaultValueForArray"
                },
                {
                    "@configFilter": "https://wizdom.sharepoint.com/sites/site1",
                    "Value": "Site1"
                },
                {
                    "@configFilter": "site2",
                    "Value": "Site2"
                },
                {
                    "@configFilter": "site2/page.aspx",
                    "Value": "Site2WithPage"
                },
                {
                    "@configFilter": "wizdom.+siteregex",
                    "Value": "RegexMatch"
                }
            ],
        }); 
    });
    
    it("should request configuration from blob", async () => {        
        testWizdomContext.blobUrl = "https://testbloburl/";
        
        await executeConfigurationRequest();

        expect(httpClientGetMock).toHaveBeenCalledTimes(1);
        expect(httpClientGetMock.mock.calls[0][0]).toBe("https://testbloburl/Base/Bundles/configuration.js?timestamp=42");
    });   

    it("should return configuration as object with no Wizdom365Config or Wizdom365AppUrl variables", async () => {            
        var configuration = await executeConfigurationRequest();
                
        expect(JSON.stringify(configuration)).not.toContain("Wizdom365Config");
        expect(JSON.stringify(configuration)).not.toContain("Wizdom365AppUrl");
    });   

    it("should return module configuration as single object when stored as an object", async () => {         
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModule"];        
        expect(moduleConfiguration).toEqual({            
            Value: "SingleConfigValue"
        });
    });      

    it("should return module configuration as a single object when stored as an array", async () => {        
        var configuration = await executeConfigurationRequest();

        var moduleConfiguration = configuration["TestModuleWithOneConfigFilters"];   
        expect(moduleConfiguration).toEqual({
            Value: "OneConfigFilterValue"            
        });
    });

    it("should return module configuration for configFilter matching default", async () => {             
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModuleWithMultipleConfigFilters"];
        expect(moduleConfiguration).toEqual({            
            Value: "DefaultValueForArray"            
        });        
    });

    it("should return module configuration for configFilter matching absolute url", async () => {             
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site1");        
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModuleWithMultipleConfigFilters"];
        expect(moduleConfiguration).toEqual({            
            "@configFilter": "https://wizdom.sharepoint.com/sites/site1",
            "Value": "Site1"            
        });
    });

    it("should return module configuration for configFilter matching site name", async () => {             
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site2");
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModuleWithMultipleConfigFilters"];
        expect(moduleConfiguration).toEqual({            
            "@configFilter": "site2",
            "Value": "Site2"            
        });
    });

    it("should return module configuration for configFilter matching longest filter", async () => {             
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site2/page.aspx");
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModuleWithMultipleConfigFilters"];
        expect(moduleConfiguration).toEqual({            
            "@configFilter": "site2/page.aspx",
            "Value": "Site2WithPage"       
        });
    });

    it("should return module configuration for configFilter matching regex", async () => {             
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/siteregex/page.aspx");
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["TestModuleWithMultipleConfigFilters"];
        expect(moduleConfiguration).toEqual({            
            "@configFilter": "wizdom.+siteregex",
            "Value": "RegexMatch"     
        });
    });

    it("should return module configuration as null for undefined module", async () => {
        var configuration = await executeConfigurationRequest();
        
        var moduleConfiguration = configuration["NotExistingModule"];
        expect(moduleConfiguration).toBeUndefined();
    });
});