import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCache } from "../caching/cache.interfaces";

/*
This module is still up for rework into an actual class with tests
*/
export async function GetWizdomConfiguration(httpClient : any, context : IWizdomContext, cache: IWizdomCache) : Promise<object>{    
    var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    var refreshIn = 10 * 60 * 1000; // 10 minutes
    var refreshDelayIn = 3 * 1000; // 3 seconds
    
    return cache.Localstorage.ExecuteCached("Configuration:" + context.appUrl, () => {        
        var configurationUrl = context.blobUrl + "Base/Bundles/configuration.js";
        return httpClient.get(configurationUrl).then(result => {            
            return result.text().then(content => {
                content = content.substr(21, content.lastIndexOf("}") - 21 + 1); // remove all the angular stuff and only save the json
                return JSON.parse(content);
            });
        });
      }, expireIn, refreshIn, refreshDelayIn).then((configuration) => {
        // Store a global variable
        window["WizdomConfiguration"] = configuration;
        return configuration;
      });
}