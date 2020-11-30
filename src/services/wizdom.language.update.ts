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
                    // debugger;
                    // console.log("Current user ProfileProperties languages:", property.Value);
                    // console.log("Wizdom languages:", wizdomConfiguration.Wizdom365.Languages);
                    // console.log("Current registered userlanguage:", currentUserLanguage);

                    var profileLanguages = property.Value.toLowerCase().split(',');
                    for (var profileLanguagesI = 0; profileLanguagesI < profileLanguages.length; profileLanguagesI++) {
                        // check if its a valid selected wizdom language
                        for (var wizdomLanguageI = 0; wizdomLanguageI < wizdomConfiguration.Wizdom365.Languages.length; wizdomLanguageI++) {
                            if (wizdomConfiguration.Wizdom365.Languages[wizdomLanguageI].Tag.toLowerCase().indexOf(profileLanguages[profileLanguagesI]) == 0) {
                                // found a match! lets update the principal if needed
                                // console.log("found language match", profileLanguages[profileLanguagesI], wizdomConfiguration.Wizdom365.Languages[wizdomLanguageI].Tag.toLowerCase());
                                if (currentUserLanguage != wizdomConfiguration.Wizdom365.Languages[wizdomLanguageI].Tag.toLowerCase()) //note, we're doing the comparison to the wizdom langauge, as the profile language might just be "en" instead of "en-us"
                                {
                                    // console.log("updating wizdom principal");
                                    this.wizdomWebApiService.Put("api/wizdom/365/principals/me/language", wizdomConfiguration.Wizdom365.Languages[wizdomLanguageI].Tag.toLowerCase()); 
                                }
                                else {
                                    // console.log("wizdom principal already uptodate");
                                }
                                return; // break out of all the for
                            }
                        }
                    }
                }
            });
            return preferredLanguage;                
        }, 
        1000 * 60 * 60 * 24 * 30, // expire in 30 days
        1000 * 60 * 60 * 12, // refresh every 12 hour
        1000 * 5); // delayed refresh in 5 seconds        
    }
}