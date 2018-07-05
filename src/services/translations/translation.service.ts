import { IWizdomTranslationService } from "./translation.interfaces";

export class WizdomTranslationService implements IWizdomTranslationService {
    
    constructor(private translations: object) {
    }

    translate(key: string): string {
        if(this.translations)
            return this.translations[key] || "[Translation missing: " + key + "]"; // fallback to the value, if no translation is defined for the spefified key
        else {
            console.warn("Wizdom translations not initialized");
            return "[Translation error: " + key + "]";
        }        
    }
}