import { IWizdomWebApiService } from "./webapi/webapi.interfaces";
import { IWizdomCache } from "./caching/cache.interfaces";
import { IHttpClient } from "../shared/httpclient.wrappers/http.interfaces";

export class WizdomLanguageUpdate {
    
    constructor(private spHttpClient: IHttpClient, private wizdomWebApiService: IWizdomWebApiService, private cache: IWizdomCache) {    }

    public async UpdateIfNeededAsync(webAbsoluteUrl: string, currentUserLanguage: string) { 
        await this.cache.Localstorage.ExecuteCached("WizdomUserLanguage", async () => {            
            var apiUrl ="/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
            return this.spHttpClient.get(webAbsoluteUrl + apiUrl)
            .then((response): Promise<string> => {          
                return response.json();
            }).then((result: any) => {
                var preferredLanguage:string = "";
                (result.UserProfileProperties).forEach(async property => {
                    if(property.Key == "SPS-MUILanguages" && property.Value)
                    {
                        preferredLanguage = property.Value.split(',')[0];                        
                        if(preferredLanguage.toLowerCase() !== currentUserLanguage.toLowerCase()){
                            this.wizdomWebApiService.Put("api/wizdom/365/principals/me/language", preferredLanguage);                        
                        }
                        return; // break loop
                    }
                });
                return preferredLanguage;                
            });
        }, 
        1000 * 60 * 60 * 24 * 30, // expire in 30 days
        1000 * 60 * 60 * 12, // refresh every 12 hour
        1000 * 5); // delayed refresh in 5 seconds        
    }
}