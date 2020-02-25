import { WizdomCorsProxyServiceFactory, WizdomWebApiServiceFactory } from "/dist/index.js";

describe('Wizdom WebApi service', () => {
    it('Normal behaviour, should be able to make request', function (done) {
        console.log("###################### RUNNING #####################");
        console.log("Port: " + location.port);
        this.timeout(3000);
        var wizdomContext = {
            appUrl : `http://localhost:${location.port}/app`,
            clientId : "0"
        }
        var pageContext = {
            site : {
                absoluteUrl : `http://localhost:${location.port}/sp`
            },
            user : {
                loginName : "user@name"
            }
        };
        console.log("123");
        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
        var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();
        WizdomWebApiService.Get("dist/test").then(done);
        // done();
    });
}); 