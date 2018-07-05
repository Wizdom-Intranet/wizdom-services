import { WizdomTranslationService } from "../translation.service";

describe("WizdomTranslationService", () => {
    it("should return translated value if initialized", () => {
        var sut = new WizdomTranslationService({
            test: 'correct value'
        });
        
        var actual = sut.translate("test");

        expect('correct value').toEqual(actual);
    });

    it("should return missing translation if key does not exist", () => {
        var sut = new WizdomTranslationService({            
        });
        
        var actual = sut.translate("test");

        expect('[Translation missing: test]').toEqual(actual);
    });

    it("should return error translation if service not initialized correct", () => {    
        var sut = new WizdomTranslationService(null);
        
        var actual = sut.translate("test");   

        expect('[Translation error: test]').toEqual(actual);
    });
});