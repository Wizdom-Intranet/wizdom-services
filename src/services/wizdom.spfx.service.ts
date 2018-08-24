import { WizdomCache } from "./caching/cache";
import { WizdomTranslationServiceFactory } from "../services/translations/translation.service.factory";
import { WizdomContextFactory } from "./context/context.factory";
import { SpfxSpHttpClient, SpfxHttpClient } from "../shared/httpclient.wrappers/http.spfx.wrappers";
import { IWizdomTranslationService } from "../services/translations/translation.interfaces";
import { IWizdomCache } from "./caching/cache.interfaces";
import { IWizdomContext } from "./context/context.interfaces";
import { getQueryStringParameterByName } from "../shared/getQueryStringParameterByName";
import { GetWizdomConfiguration } from "./configuration/configuration";
import { IWizdomWebApiService } from "./webapi/webapi.interfaces";
import { WizdomWebApiServiceFactory } from "./webapi/webapi.service.factory";
import { IWizdomCorsProxyService } from "./corsproxy/corsproxy.interfaces";
import { WizdomCorsProxyServiceFactory } from "./corsproxy/corsproxy.service.factory";

export class WizdomSpfxServices {
    public Cache: IWizdomCache;
    public WizdomContext: IWizdomContext;
    public TranslationService: IWizdomTranslationService;
    public WizdomConfiguration: any;
    public WizdomWebApiService: IWizdomWebApiService;
    public WizdomCorsProxyService: IWizdomCorsProxyService
    protected spContext: any;

    constructor(spContext: any) {
        this.spContext = spContext;
    }

    public async InitAsync(options: any) : Promise<void> {  
        if(console.info != null)
            console.info("wizdom-intranet/services initializing");
        
        try {
            // Check for development mode            
            var developmentmodeQueryString = getQueryStringParameterByName("wizdomdevelopermode", window.location.href);
            var wizdomdevelopermode = developmentmodeQueryString != null && developmentmodeQueryString.toLowerCase() != "false";

            // Initialize all services
            this.Cache = new WizdomCache();

            var contextFactory = new WizdomContextFactory(new SpfxSpHttpClient(this.spContext.spHttpClient), this.Cache, wizdomdevelopermode);
            this.WizdomContext = await contextFactory.GetWizdomContextAsync(this.spContext.pageContext.site.absoluteUrl);    

            var language = this.spContext.pageContext.cultureInfo.currentUICultureName;
            var spLanguageQueryString = getQueryStringParameterByName("SPLanguage", window.location.href);
            if(spLanguageQueryString)
                language = spLanguageQueryString;                
            var translationServiceFactory = new WizdomTranslationServiceFactory(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache);
            var translationServicePromise = translationServiceFactory.CreateAsync(language).then(translationService => {
                this.TranslationService = translationService;
            });

            var configurationPromise = GetWizdomConfiguration(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache).then(configuration => {
                this.WizdomConfiguration = configuration;
            });

            var wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(this.WizdomContext, this.spContext.pageContext.site.absoluteUrl, this.spContext.pageContext.user.loginName);        
            this.WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();                        
            var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, this.spContext.pageContext.site.absoluteUrl);
            this.WizdomWebApiService = wizdomWebApiServiceFactory.Create();

            await Promise.all([translationServicePromise, configurationPromise]);                       

            console.info("wizdom-intranet/services initialized");
        } catch(ex) {
            if(console.exception != null)
                console.exception("wizdom-intranet/services initializing error", ex);
        }          
    }
}