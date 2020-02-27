import { WizdomCorsProxyServiceFactory, WizdomWebApiServiceFactory } from "/dist/index.js";
import sinon from '/node_modules/sinon/pkg/sinon-esm.js';

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

    if(window.clock)
    {
        window.clock.restore();
        delete window.clock;
    }
}

describe('Wizdom WebApi service', () => {
    // it('should be able to make requests, if appredirect and corsproxy is working correctly', async function () {
    //     clearContext();
    //     await fetch("/config", {
    //         method:"POST",
    //         headers: {
    //             "appredirect":"appredirect.working.html",
    //             "corsproxy":"corsproxy.working.html"
    //         }
    //     });
        
    //     var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
    //     // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
    //     var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
    //     var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

    //     var res = await WizdomWebApiService.Get("dist/test");
    //     assert.isDefined(res);
    //     assert.isFalse(window["WizdomWebApiServiceState"].corsProxyFailed);
    //     assert.isTrue(window["WizdomWebApiServiceState"].corsProxyReady);
    // });

    // // We're not actually yet able to detect if we get stuck on the appRedirect page. This will normally happend if the appUrl does not match the registered appUrl
    // // it('Fail if stuck on redirect', async function () {
    // //     clearContext();
    // //     await fetch("/config", {
    // //         method:"POST",
    // //         headers: {
    // //             "appredirect":"appredirect.stuck.html",
    // //             "corsproxy":"corsproxy.html"
    // //         }
    // //     });

    // //     var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
    // //     // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
    // //     var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
    // //     var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

    // //     WizdomWebApiService.Get("dist/test");
    // //     return new Promise((resolve)=>{
    // //         setTimeout(()=>{
    // //             assert.isTrue(window["WizdomWebApiServiceState"].corsProxyFailed, "WizdomWebApiServiceState.corsProxyFailed should be true");
    // //             resolve();
    // //         }, 1000);
    // //     });
    // // });

    // it('should set WizdomWebApiServiceState.corsProxyFailed to true, if the corsproxy sends "Initialization failed"', async function () {
    //     clearContext();
    //     await fetch("/config", {
    //         method:"POST",
    //         headers: {
    //             "appredirect":"appredirect.working.html",
    //             "corsproxy":"corsproxy.initFailed.html"
    //         }
    //     });

    //     var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
    //     // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
    //     var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
    //     var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

    //     WizdomWebApiService.Get("dist/test");
    //     return new Promise((resolve)=>{
    //         setTimeout(()=>{
    //             assert.isTrue(window["WizdomWebApiServiceState"].corsProxyFailed, "WizdomWebApiServiceState.corsProxyFailed should be true");
    //             resolve();
    //         }, 1000);
    //     });
    // });
    // it('should set WizdomWebApiServiceState.corsProxyFailed to true, if the corsproxy shows an errorpage, instead of a correctly rendered succcess or init failed page', async function () {
    //     clearContext();
    //     await fetch("/config", {
    //         method:"POST",
    //         headers: {
    //             "appredirect":"appredirect.working.html",
    //             "corsproxy":"corsproxy.errorpage.html"
    //         }
    //     });

    //     var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
    //     // var WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();       
    //     var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
    //     var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

    //     WizdomWebApiService.Get("dist/test");
    //     return new Promise((resolve)=>{
    //         setTimeout(()=>{
    //             assert.isTrue(window["WizdomWebApiServiceState"].corsProxyFailed, "WizdomWebApiServiceState.corsProxyFailed should be true");
    //             resolve();
    //         }, 1000);
    //     });
    // });
    it('should automatically renew the token, when its about to expire', async function(){
        clearContext();
        await fetch("/config", {
            method:"POST",
            headers: {
                "appredirect":"appredirect.working.html",
                "corsproxy":"corsproxy.working.html"
            }
        });

        window.clock = sinon.useFakeTimers({
            now : new Date()*1,
            shouldAdvanceTime : true
        });
        console.log(new Date());
        // setTimeout(()=>console.log("test"), 30000);
        // window.clock.tick(60000);
        // console.log(new Date());

        // make a simple request
        var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(wizdomContext, pageContext.site.absoluteUrl, pageContext.user.loginName);        
        var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, pageContext.site.absoluteUrl);
        var WizdomWebApiService = wizdomWebApiServiceFactory.Create();

        await WizdomWebApiService.Get("dist/test");

        // advance clock til one minutte before token expires, and listen for a new corsproxy ready message
        window.addEventListener('message', (e)=>{
            console.log("Got a message", e);
        }, false);
        window.clock.tick(window["WizdomCorsProxyState"].msLeftOnToken-120000);
        console.log(new Date());
    });
}); 