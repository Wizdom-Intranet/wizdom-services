import { IWizdomCache } from "../caching/cache.interfaces";
import { IWizdomTranslationService } from "./translation.interfaces";
import { WizdomTranslationService } from "./translation.service";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";
import { IWizdomContext } from "../context/context.interfaces";

export class WizdomTranslationServiceFactory {
        
    constructor(private httpClient: IHttpClient, private context: IWizdomContext, private cache: IWizdomCache) {
    }

    CreateAsync(language: string) : Promise<IWizdomTranslationService> {
        var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
        var refreshIn = 10 * 60 * 1000; // 10 minutes
        var refreshDelayIn = 3 * 1000; // 3 seconds
        
        return this.cache.Localstorage.ExecuteCached("Translation:" + this.context.appUrl + "." + language.toLowerCase(), async () => {
            let timestamp = await this.cache.Timestamps.Get("Translation");
            var translationUrl = this.context.blobUrl + "Base/Bundles/translations-" + language.toLowerCase() + ".js?timestamp=" + timestamp;
            
            var result = await this.httpClient.get(translationUrl); // https://www.npmjs.com/package/unfetch
            if (!result.ok) {
                // fallback to en-us
                translationUrl = this.context.blobUrl + "Base/Bundles/translations-en-us.js?timestamp=" + timestamp;
                result = await this.httpClient.get(translationUrl);
            }
            var content = await result.text();                    
            var jsonStartIndex = content.indexOf("{");
            var jsonEndIndex = content.indexOf("}}") + 2;
            content = content.substr(jsonStartIndex, jsonEndIndex - jsonStartIndex); // remove all the angular stuff and only save the json
            let translations: any = JSON.parse(content)[language.toLowerCase()];            
            return translations;
        }, expireIn, refreshIn, refreshDelayIn)
        .then((translations) => {
            // Store a global variable
            window["WizdomTranslations"] = translations;                           
            return new WizdomTranslationService(translations, this.context.wizdomdevelopermode);            
        });
    }
}