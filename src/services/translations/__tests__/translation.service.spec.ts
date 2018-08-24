import { WizdomTranslationService } from "../translation.service";

describe("WizdomTranslationService", () => {
    it("should return translated value if initialized", () => {
        var sut = new WizdomTranslationService({
            test: 'correct value'
        });
        
        var actual = sut.translate("test");

        expect('correct value').toEqual(actual);
    });

    it("should return translation key if key does not exist", () => {
        var developmentmode = false;        
        var sut = new WizdomTranslationService({            
        }, developmentmode);
        
        var actual = sut.translate("test");

        expect('test').toEqual(actual);
    });

    it("should return translation key if service not initialized correct", () => {    
        var developmentmode = false;
        var sut = new WizdomTranslationService(null, developmentmode);
        
        var actual = sut.translate("test");   

        expect('test').toEqual(actual);
    });

    it("should return missing translation if key does not exist", () => {
        var developmentmode = true;
        var sut = new WizdomTranslationService({            
        }, developmentmode);
        
        var actual = sut.translate("test");

        expect('[Translation missing: test]').toEqual(actual);
    });

    it("should return error translation if service not initialized correct", () => {  
        var developmentmode = true;  
        var sut = new WizdomTranslationService(null, developmentmode);
        
        var actual = sut.translate("test");   

        expect('[Translation error: test]').toEqual(actual);
    });
});