import { IWizdomCorsProxyService, IWizdomCorsProxySharedState, IWizdomCorsProxyServiceFactory } from "../../corsproxy/corsproxy.interfaces"
import { WizdomWebApiServiceFactory } from "../webapi.service.factory";

describe("WizdomWebApiServiceFactory", () => {  
    
    var corsProxy : IWizdomCorsProxyService;
    var webapiServiceFactory: WizdomWebApiServiceFactory;

    beforeEach(() => {
        corsProxy = {
            Message: () => {},
            AddHandler: () => {},
            corsProxyState: {} as IWizdomCorsProxySharedState,
            HandleMessage: () => {}
        } as IWizdomCorsProxyService

        var fakeCorsProxyFactory = { GetOrCreate(){ return corsProxy; } } as IWizdomCorsProxyServiceFactory;
        webapiServiceFactory = new WizdomWebApiServiceFactory(fakeCorsProxyFactory, "http://sharepointHostUrl.com");
    });

    it("should expose WizdomWebApiService on window object", () => {
        var webapiService = webapiServiceFactory.Create();

        expect(webapiService).not.toBeNull();
        expect(webapiService).toBe(window["WizdomWebApiService"]);
    });
});