import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCache } from "../caching/cache.interfaces";
import { ConfigurationParser } from "./configurationParser";

export async function GetWizdomConfiguration(httpClient : any, context : IWizdomContext, cache: IWizdomCache, whiteListedModulesToParse: string[]) : Promise<object>{    
    var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    var refreshIn = 10 * 60 * 1000; // 10 minutes
    var refreshDelayIn = 3 * 1000; // 3 seconds
    
    return cache.Localstorage.ExecuteCached("Configuration:" + context.appUrl, async () => {
        var configurationUrl = context.blobUrl + "Base/Bundles/configuration.js?timestamp="+ (await cache.Timestamps.Get("Configuration"));
        return httpClient.get(configurationUrl).then(result => {            
            return result.text().then(content => {
                content = content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1); // remove all the angular stuff and only save the json
                return JSON.parse(content);
            });
        });
      }, expireIn, refreshIn, refreshDelayIn).then((configuration) => {          
        // Ensuring all module configurations consist of only one object        
        var configurationParser = new ConfigurationParser(configuration);
        Object.keys(configuration).forEach(moduleKey => {
            if(whiteListedModulesToParse.indexOf(moduleKey) != -1) {
                configuration[moduleKey] = configurationParser.TransformModuleConfigurationToASingleObject(moduleKey);
            }
        });        

        // Store a global variable
        window["WizdomConfiguration"] = configuration;
        return configuration;
      });
}