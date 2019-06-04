import { WizdomCache } from "./caching/cache";
import { WizdomTranslationServiceFactory } from "../services/translations/translation.service.factory";
import { WizdomContextFactory } from "./context/context.factory";
import { SpfxSpHttpClient, SpfxHttpClient } from "../shared/httpclient.wrappers/http.spfx.wrappers";
import { IWizdomTranslationService } from "../services/translations/translation.interfaces";
import { IWizdomCache } from "./caching/cache.interfaces";
import { IWizdomContext } from "./context/context.interfaces";
import { GetWizdomConfiguration } from "./configuration/configuration";
import { IWizdomWebApiService } from "./webapi/webapi.interfaces";
import { WizdomWebApiServiceFactory } from "./webapi/webapi.service.factory";
import { IWizdomCorsProxyService } from "./corsproxy/corsproxy.interfaces";
import { WizdomCorsProxyServiceFactory } from "./corsproxy/corsproxy.service.factory";
import { IWizdomDeveloperMode } from "../shared/developermode.interface";
import { LocationWrapper } from "../shared/location.wrapper";

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

    public async InitAsync(options: any) {  
        if(console.info != null)
            console.info("initializing wizdom-intranet/services");
        
        try {
            // Check for development mode            
            var locationWrapper = new LocationWrapper();
            var developmentmodeQueryString = locationWrapper.GetQueryString("wizdomdevelopermode");

            var wizdomdevelopermode: IWizdomDeveloperMode;
            if(developmentmodeQueryString != null && developmentmodeQueryString.toLowerCase() != "false"){
                try{
                    wizdomdevelopermode = JSON.parse(developmentmodeQueryString) as IWizdomDeveloperMode;
                } catch(ex){
                    console.error("Invalid developermode", ex);                    
                }
            }
            // Initialize all services
            this.Cache = new WizdomCache(wizdomdevelopermode, locationWrapper, new SpfxSpHttpClient(this.spContext.spHttpClient), this.spContext.pageContext.site.absoluteUrl);

            var contextFactory = new WizdomContextFactory(new SpfxSpHttpClient(this.spContext.spHttpClient), this.Cache, wizdomdevelopermode);
            this.WizdomContext = await contextFactory.GetWizdomContextAsync(this.spContext.pageContext.site.absoluteUrl);    

            var language = this.spContext.pageContext.cultureInfo.currentUICultureName;
            var spLanguageQueryString = locationWrapper.GetQueryString("SPLanguage");
            if(spLanguageQueryString)
                language = spLanguageQueryString;
            var translationServiceFactory = new WizdomTranslationServiceFactory(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache);
            var translationServicePromise = translationServiceFactory.CreateAsync(language).then(translationService => {
                this.TranslationService = translationService; 
            });

            var specificConfigurationParsingModules: ["Megamenu", "CssGenerator", "Footer", "MarkAsRead", "Powerpanel", "CustomStyling", "CustomJs", "ModernCustomStyling", "ModernCustomJs"];
            var configurationPromise = GetWizdomConfiguration(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache, specificConfigurationParsingModules).then(configuration => {
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