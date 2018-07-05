import { IWizdomWebApiServiceConfig } from "../webapi.interfaces";
import { WizdomWebApiUrlBuilder } from "../webapi.urlBuilder";

describe("WizdomWebApiUrlBuilder", () => {

    var config = {            
        appUrl: "http://appurl.com",
        clientId: "1337",
        userLoginName: "test@test.com",
        spHostUrl: "http://sharepointHostUrl.com"
    } as IWizdomWebApiServiceConfig;
    
    var urlBuilder = new WizdomWebApiUrlBuilder(config);

    it("should handle path releative api url", () => {           
        var result = urlBuilder.getApiRelativeUrl("api/test");

        expect(result).toBe("/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });

    it("should handle host releative api url", () => {        
        var result = urlBuilder.getApiRelativeUrl("/api/test");

        expect(result).toBe("/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });

    it("should", async () => {
        var result = urlBuilder.getAppRedirectUrl();

        expect(result).toContain("client_id=");
        expect(result).toContain("redirect_uri=");
        expect(result).toContain("http://appurl.com/Base/WizdomCorsProxy.aspx?{StandardTokens}");
        expect(result).toContain("userLoginName=");
    })
});