import { WizdomTranslationService } from "../translation.service";
import { IWizdomDeveloperMode } from "../../../shared/developermode.interface";

describe("WizdomTranslationService", () => {
    (window as any).console = {};    
    const mockConsoleWarn = jest.fn();  
    window.console.warn = mockConsoleWarn; 
    const mockConsoleError = jest.fn();  
    window.console.error = mockConsoleError; 
 
    it("should return translated value if initialized", () => {
        var sut = new WizdomTranslationService({
            test: 'correct value'
        }, null);
        
        var actual = sut.translate("test");

        expect('correct value').toEqual(actual);
    });

    it("should return translation key if key does not exist", () => {
        var developermode = null;        
        var sut = new WizdomTranslationService({           
        }, developermode);
        
        var actual = sut.translate("test");

        expect('test').toEqual(actual);
    });

    it("should return translation key if service not initialized correct", () => {    
        var developermode = null;
        var sut = new WizdomTranslationService(null, developermode);
        
        var actual = sut.translate("test");   

        expect('test').toEqual(actual);
    });

    it("should return missing translation if key does not exist", () => {
        var developermode = {} as IWizdomDeveloperMode;
        var sut = new WizdomTranslationService({            
        }, developermode);
        
        var actual = sut.translate("test");

        expect('[Translation missing: test]').toEqual(actual);
    });

    it("should return key if it's null, even in developermode", () => {
        var developermode = {} as IWizdomDeveloperMode;
        var sut = new WizdomTranslationService({            
        }, developermode);
        
        var actual = sut.translate(null);

        expect(null).toEqual(actual);
    });
    
    it("should return key if it's empty string, even in developermode", () => {
        var developermode = {} as IWizdomDeveloperMode;
        var sut = new WizdomTranslationService({            
        }, developermode);
        
        var actual = sut.translate("");

        expect("").toEqual(actual);
    });
    
    it("should write error to console for missing translation if developermode configured for it", () => {
        var developermode = {
            errorMissingTranslations: true
        } as IWizdomDeveloperMode;
        var sut = new WizdomTranslationService({            
        }, developermode);
        
        var actual = sut.translate("test");

        expect(mockConsoleError.mock.calls[0][0]).toBe("[Translation missing: test]");
    });

    

    it("should return error translation if service not initialized correct", () => {  
        var developermode = {} as IWizdomDeveloperMode;  
        var sut = new WizdomTranslationService(null, developermode);
        
        var actual = sut.translate("test");   

        expect('[Translation error: test]').toEqual(actual);
        expect(mockConsoleWarn.mock.calls[0][0]).toBe("Wizdom translations not initialized");
    });
});