import { IWizdomTranslationService } from "./translation.interfaces";

export class WizdomTranslationService implements IWizdomTranslationService {
    
    constructor(private translations: object, private wizdomdevelopermode: boolean = false) {    
    }

    translate(key: string): string {
        if(this.translations)
            return this.translations[key] || (this.wizdomdevelopermode ? "[Translation missing: " + key + "]" : key); // fallback to the value, if no translation is defined for the spefified key
        else {
            console.warn("Wizdom translations not initialized");
            return this.wizdomdevelopermode ? "[Translation error: " + key + "]" : key;
        }        
    }
}