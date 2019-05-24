import { ConfigurationParser } from "../configurationParser";

describe("ConfigurationParser", () => {        
    var testData = {    
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
                "Value": "Default"
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
        ]    
    };

    var setWindowLocationHref = (url:string) => {
        Object.defineProperty(window, "location", {
            value: {
                href: url
            },
            writable: true // Allow overwrite in next test method
        });
    }

    var configurationParser;
    beforeEach(() => {
        configurationParser = new ConfigurationParser(testData);
    });

    it("should return single module configuration", async () => {                
        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModule");

        expect(moduleConfiguration).toEqual({"Value":"SingleConfigValue"});
    });   

    it("should return the only configuration if there is only one filtered config", async () => {     
        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithOneConfigFilters");

        expect(moduleConfiguration).toEqual({"Value":"OneConfigFilterValue"});
    });

    it("should return default configuration for default url", async () => {     
        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithMultipleConfigFilters");

        expect(moduleConfiguration).toEqual({"Value":"Default"});
    });

    it("should return filtered config matching full url", async () => {             
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site1");

        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithMultipleConfigFilters");

        expect(moduleConfiguration).toEqual({
            "@configFilter": "https://wizdom.sharepoint.com/sites/site1",
            "Value": "Site1"
        });
    });

    it("should return filtered configuration matching site name", async () => {                       
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site2");

        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithMultipleConfigFilters");

        expect(moduleConfiguration).toEqual({
            "@configFilter": "site2",
            "Value": "Site2"
        });
    });

    it("should return filtered configuration matching longest match", async () => {                               
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/site2/page.aspx");

        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithMultipleConfigFilters");

        expect(moduleConfiguration).toEqual({
            "@configFilter": "site2/page.aspx",
            "Value": "Site2WithPage"
        });
    });

    it("should return filtered configuration matching regex match", async () => {                               
        setWindowLocationHref("https://wizdom.sharepoint.com/sites/siteregex/page.aspx");

        var moduleConfiguration = configurationParser.GetModuleConfiguration("TestModuleWithMultipleConfigFilters");

        expect(moduleConfiguration).toEqual({
            "@configFilter": "wizdom.+siteregex",
            "Value": "RegexMatch"
        });
    });
});