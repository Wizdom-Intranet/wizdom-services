import { IWizdomContext } from "./context.interfaces";
import { IWizdomCache } from "../caching/cache.interfaces";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";

export class WizdomContextFactory {

    private storageEntityContext: IWizdomContext = {
        blobUrl : "",
        appUrl : "",
        clientId : "",
        wizdomdevelopermode : null
    };
    private allPropertiesContext: IWizdomContext
    constructor(private spHttpClient: IHttpClient, private cache: IWizdomCache, private wizdomdevelopermode: IWizdomDeveloperMode) {

    }

    GetWizdomContextAsync(siteAbsoluteUrl: string): Promise<IWizdomContext> {
        var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
        var refreshIn = 10 * 60 * 1000; // 10 minutes
        var refreshDelayIn = 3 * 1000; // 3 seconds

        return this.cache.Localstorage.ExecuteCached("Context:" + siteAbsoluteUrl, () => {

            var storageEntityPromise = this.spHttpClient.get(siteAbsoluteUrl + "/_api/web/GetStorageEntity('wizdom.properties')").then((result) => {
                return result.json().then((json) => {
                    if(json.Value)
                    {
                        var context: IWizdomContext = JSON.parse(json.Value);
                        // ensure tailing / for app- and bloburl
                        if (context.blobUrl.substr(-1) != "/")
                            context.blobUrl = context.blobUrl + "/";
                        if (context.appUrl.substr(-1) != "/")
                            context.appUrl = context.appUrl + "/";
    
                        this.storageEntityContext = context;
                    }
                });
            });

            var allPropertiesPromise = this.spHttpClient.get(siteAbsoluteUrl + "/_api/web/AllProperties?$select=wizdom.properties").then((result) => {

                return result.json().then((json) => {
                    if (json.wizdom_x002e_properties) {
                        var context: IWizdomContext = JSON.parse(json.wizdom_x002e_properties);
                        // ensure tailing / for app- and bloburl
                        if (context.blobUrl.substr(-1) != "/")
                            context.blobUrl = context.blobUrl + "/";
                        if (context.appUrl.substr(-1) != "/")
                            context.appUrl = context.appUrl + "/";

                        this.allPropertiesContext = context;
                    }
                });
            });

            return Promise.all([storageEntityPromise, allPropertiesPromise]).then(() => {
                if (this.allPropertiesContext) {
                    if (this.allPropertiesContext.appUrl)
                        this.storageEntityContext.appUrl = this.allPropertiesContext.appUrl
                    if (this.allPropertiesContext.blobUrl)
                        this.storageEntityContext.blobUrl = this.allPropertiesContext.blobUrl
                    if (this.allPropertiesContext.clientId)
                        this.storageEntityContext.clientId = this.allPropertiesContext.clientId
                }
                return this.storageEntityContext;
            });
        }, expireIn, refreshIn, refreshDelayIn)

            .then((context) => {
                // Store a global variable                       
                var wizdomContext = context as IWizdomContext;
                wizdomContext.wizdomdevelopermode = this.wizdomdevelopermode;
                if (this.wizdomdevelopermode && this.wizdomdevelopermode.wizdomContext) {
                    wizdomContext = { ...wizdomContext, ...this.wizdomdevelopermode.wizdomContext };
                }
                window["WizdomContext"] = wizdomContext;
                return wizdomContext;
            });
    }
}