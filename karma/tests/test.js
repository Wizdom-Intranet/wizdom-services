import { WizdomCorsProxyServiceFactory, WizdomWebApiServiceFactory } from "/dist/index.js";

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

function clearContext(){
    // remove all global  variables, localstorage and iframes related to wizdom
    Object
        .keys(window)
        .filter(k=>k.indexOf("Wizdom")==0)
        .map(key=>delete window[key]);

    Object
        .keys(window.localStorage)
        .filter(k=>k.toLowerCase().indexOf("wiz")==0)
        .map(key=>window.localStorage.removeItem(key))

    var iframes = document.querySelectorAll("iframe[src*='CorsProxy']");
    for(var i=0;i<iframes.length;i++)
        iframes[i].remove();
}

describe('Wizdom WebApi service', () => {
    it('Normal behaviour, should be able to make request', async function () {
        clearContext();
        await fetch("/config", {
            method:"POST",
            headers: {
                "appredirect":"appredirect.working.html",
                "corsproxy":"corsproxy.html"
            }
        });
        
        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
        // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

        var res = await WizdomWebApiService.Get("dist/test");
        assert.isDefined(res);
    });

    it('Fail if stuck on redirect', async function () {
        clearContext();
        await fetch("/config", {
            method:"POST",
            headers: {
                "appredirect":"appredirect.stuck.html",
                "corsproxy":"corsproxy.html"
            }
        });

        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
        // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

        WizdomWebApiService.Get("dist/test");
        return new Promise((resolve)=>{
            setTimeout(()=>{
                assert.isTrue(window["WizdomWebApiServiceState"].corsProxyFailed, "WizdomWebApiServiceState.corsProxyFailed should be true");
                resolve();
            }, 1000);
        });
    });

    it('Fail if corsproxy init failed', async function () {
        clearContext();
        await fetch("/config", {
            method:"POST",
            headers: {
                "appredirect":"appredirect.working.html",
                "corsproxy":"corsproxy.initFailed.html"
            }
        });

        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
        // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

        WizdomWebApiService.Get("dist/test");
        return new Promise((resolve)=>{
            setTimeout(()=>{
                assert.isTrue(window["WizdomWebApiServiceState"].corsProxyFailed, "WizdomWebApiServiceState.corsProxyFailed should be true");
                resolve();
            }, 1000);
        });
    });
}); 