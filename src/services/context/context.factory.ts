import { IWizdomContext } from "./context.interfaces";
import { IWizdomCache } from "../caching/cache.interfaces";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";

export class WizdomContextFactory {

    constructor(private spHttpClient: IHttpClient, private cache: IWizdomCache) {        
    }

    GetWizdomContextAsync(siteAbsoluteUrl: string): Promise<IWizdomContext> {
        var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
        var refreshIn = 10 * 60 * 1000; // 10 minutes
        var refreshDelayIn = 3 * 1000; // 3 seconds
    
        return this.cache.Localstorage.ExecuteCached("Context:" + siteAbsoluteUrl, () => {
            return this.spHttpClient.get(siteAbsoluteUrl + "/_api/web/GetStorageEntity('wizdom.properties')").then((result)=>{           
                return result.json().then((json) => {
                    var context : IWizdomContext = JSON.parse(json.Value);
                    // ensure tailing / for app- and bloburl
                    if(context.blobUrl.substr(-1) != "/")
                        context.blobUrl = context.blobUrl + "/";
                    if(context.appUrl.substr(-1) != "/")
                        context.appUrl = context.appUrl + "/";
                    
                    return context;
                });
            });    
        },  expireIn, refreshIn, refreshDelayIn)
    
        .then((context) => {
            // Store a global variable
            window["WizdomContext"] = context;
            return context as IWizdomContext;
        });
    }
}