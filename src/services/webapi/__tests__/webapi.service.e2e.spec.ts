import { WizdomWebApiService } from "../webapi.service";
import { IWizdomWebApiServiceState, IWizdomWebApiService, WebApiErrorType } from "../webapi.interfaces";
import { IWizdomCorsProxyService, IWizdomCorsProxySharedState, IWizdomCorsProxyServiceFactory } from "../../corsproxy/corsproxy.interfaces"
import { WizdomWebApiServiceFactory } from "../webapi.service.factory";
import { WizdomCorsProxyServiceFactory } from "../../corsproxy/corsproxy.service.factory";
import { IWizdomContext } from "../../context/context.interfaces";

describe("WizdomWebApiService.e2e", () => {
    var spHostUrl = "http://sp.host.url";
    var loginName = "login@name";

    var wizdomContext : IWizdomContext = {
        appUrl : "http://app.url",
        blobUrl : "http://blob.url",
        clientId : "client.id",
        wizdomdevelopermode : null
    };

    it("does something", () => {  
        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, spHostUrl, loginName);        
        var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();                        
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, spHostUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();
        
        WizdomWebApiService.Get("/test");
    });
});