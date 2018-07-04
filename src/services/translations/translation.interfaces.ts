export interface IWizdomTranslationService {
    // /**      
    // * @returns culture string ex. 'en-us' or 'da-dk'  
    // */
    // getLanguage: string;
    // /**
    // * @param cultureName  ex. 'en-us' or 'da-dk'  
    // */
    // setLanguage(cultureName: string);
    /**
    * @param key    translation key
    * @returns translated string.
    */
    translate(key: string): string;
}