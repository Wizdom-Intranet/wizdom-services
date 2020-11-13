import { IWizdomWebApiService } from "./webapi/webapi.interfaces";
import { IWizdomCache } from "./caching/cache.interfaces";
import { IHttpClient } from "../shared/httpclient.wrappers/http.interfaces";
import { IWizdomContext } from "./context/context.interfaces";

export class WizdomLanguageUpdate {
    
    constructor(private spHttpClient: IHttpClient, private wizdomWebApiService: IWizdomWebApiService, private cache: IWizdomCache) {    }

    public async UpdateIfNeededAsync(webAbsoluteUrl: string, currentUserLanguage: string, wizdomConfiguration: any) { 
        await this.cache.Localstorage.ExecuteCached("WizdomUserLanguage", async () => {           
            var apiUrl ="/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
            var response = await this.spHttpClient.get(webAbsoluteUrl + apiUrl);            
            var result:any = await response.json();
            var preferredLanguage:string = "";
            (result.UserProfileProperties).forEach(async property => {
                if(property.Key == "SPS-MUILanguages" && property.Value)
                {
                    preferredLanguage = property.Value.split(',')[0];                        
                    if(preferredLanguage.toLowerCase() !== currentUserLanguage.toLowerCase()){
                        if(wizdomConfiguration && wizdomConfiguration.Wizdom365 && wizdomConfiguration.Wizdom365.Languages)
                        {
                            for(var i=0; i<wizdomConfiguration.Wizdom365.Languages.length; i++){
                                if(wizdomConfiguration.Wizdom365.Languages[0].Tag.toLowerCase() == preferredLanguage.toLowerCase())
                                {
                                    this.wizdomWebApiService.Put("api/wizdom/365/principals/me/language", preferredLanguage); 
                                    break;
                                }
                            }                            
                        }                                                   
                    }
                    return; // break loop
                }
            });
            return preferredLanguage;                
        }, 
        1000 * 60 * 60 * 24 * 30, // expire in 30 days
        1000 * 60 * 60 * 12, // refresh every 12 hour
        1000 * 5); // delayed refresh in 5 seconds        
    }
}