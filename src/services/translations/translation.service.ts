import { IWizdomTranslationService } from "./translation.interfaces";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";

export class WizdomTranslationService implements IWizdomTranslationService {
    
    constructor(private translations: object, private wizdomdevelopermode: IWizdomDeveloperMode) {    
    }

    translate(key: string): string {        
        if(key == null || key == undefined || key == "")
            return key;
            
        if(this.translations){
            var translation = this.translations[key];            
            if(translation == null) { // Missing translation                
                if(this.wizdomdevelopermode) {
                    translation = "[Translation missing: " + key + "]";
                    if(this.wizdomdevelopermode.errorMissingTranslations) {
                        console.error(translation);
                    }
                }
                else
                    translation = key;
            }            
            return translation;
        }
        else {
            console.warn("Wizdom translations not initialized");
            return this.wizdomdevelopermode ? "[Translation error: " + key + "]" : key;
        }        
    }
}