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
import { IWizdomCorsProxySharedState } from "./corsproxy/corsproxy.interfaces";
import { IWizdomDeveloperMode } from "../shared/developermode.interface";
import { LocationWrapper } from "../shared/location.wrapper";
import { WizdomLanguageUpdate } from "./wizdom.language.update";
import { AadHttpClient } from "@microsoft/sp-http";
import { WizdomCorsProxyService } from "./corsproxy/corsproxy.service";

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
        try {
            if(window["WizdomCurrentSpHostUrl"] != this.spContext.pageContext.site.absoluteUrl)  {
                // navigated to another sitecollection. Reset wizdom
                console.log("resetting wizdom corsproxy");
    
                window["WizdomCorsProxyState"] = null;
                window["WizdomCorsProxy"] = null;
                window["WizdomWebApiService"] = null;
                window["WizdomWebApiServiceState"] = null;
                
                // window["WizdomContext"] = null;
                // window["WizdomCache"] = null;
                // window["WizdomConfiguration"] = null;        
            } 
            window["WizdomCurrentSpHostUrl"] = this.spContext.pageContext.site.absoluteUrl;      
           
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
            // 402cbaeb-c52a-43b6-b886-4ad1c44cab6a
            let aadHttpClientFactory = (clientId)=>this.spContext.aadHttpClientFactory.getClient(clientId);

            // Initialize all services
            this.Cache = new WizdomCache(wizdomdevelopermode, locationWrapper, new SpfxSpHttpClient(this.spContext.spHttpClient), this.spContext.pageContext.site.absoluteUrl);

            var contextFactory = new WizdomContextFactory(new SpfxSpHttpClient(this.spContext.spHttpClient), this.Cache, wizdomdevelopermode, aadHttpClientFactory);
            this.WizdomContext = await contextFactory.GetWizdomContextAsync(this.spContext.pageContext.site.absoluteUrl);    

            var language = this.spContext.pageContext.cultureInfo.currentUICultureName;
            var spLanguageQueryString = locationWrapper.GetQueryString("SPLanguage");
            if(spLanguageQueryString)
                language = spLanguageQueryString;
            var translationServiceFactory = new WizdomTranslationServiceFactory(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache);
            var translationServicePromise = translationServiceFactory.CreateAsync(language).then(translationService => {
                this.TranslationService = translationService; 
            });

            var specificConfigurationParsingModules = ["Megamenu", "CssGenerator", "Footer", "MarkAsRead", "Powerpanel", "CustomStyling", "CustomJs", "ModernCustomStyling", "ModernCustomJs"];
            var configurationPromise = GetWizdomConfiguration(new SpfxHttpClient(this.spContext.httpClient), this.WizdomContext, this.Cache, specificConfigurationParsingModules).then(configuration => {
                this.WizdomConfiguration = configuration;
            });

            let updateWizdomLanguage = async () => {
                await configurationPromise;
                var wizdomLanguageUpdate = new WizdomLanguageUpdate(new SpfxSpHttpClient(this.spContext.spHttpClient), this.WizdomWebApiService, this.Cache);
                wizdomLanguageUpdate.UpdateIfNeededAsync(this.spContext.pageContext.web.absoluteUrl, window["WizdomCorsProxyState"].currentUserLanguage, this.WizdomConfiguration);
            }
            let wizdomCorsProxyServiceFactory: WizdomCorsProxyServiceFactory; 
            if(!this.WizdomContext.isWizdomSaaS) {
                wizdomCorsProxyServiceFactory = new WizdomCorsProxyServiceFactory(this.WizdomContext, this.spContext.pageContext.site.absoluteUrl, this.spContext.pageContext.user.loginName);        
                this.WizdomCorsProxyService = wizdomCorsProxyServiceFactory.GetOrCreate();                        
            
                // When cors proxy initialized successfully
                this.WizdomCorsProxyService.AddHandler("WizdomCorsProxySuccess", updateWizdomLanguage);

                this.WizdomContext.serverContext = {
                    allWizdomRoles: window["WizdomCorsProxyState"].allWizdomRoles,
                    rolesForCurrentUser: window["WizdomCorsProxyState"].rolesForCurrentUser,
                    currentUserLanguage: window["WizdomCorsProxyState"].currentUserLanguage,
                }
            }
            else {
                window["WizdomCorsProxyState"] = window["WizdomCorsProxyState"] || {            
                    session: "", 
                    msLeftOnToken: 0, 
                    allWizdomRoles: this.WizdomContext?.serverContext?.allWizdomRoles, 
                    rolesForCurrentUser: this.WizdomContext?.serverContext?.rolesForCurrentUser, 
                    upgradeInProgress: false,
                    currentUserLanguage: this.WizdomContext?.serverContext?.currentUserLanguage,
                    corsProxyFailed: false
                } as IWizdomCorsProxySharedState;

                updateWizdomLanguage();

                this.WizdomCorsProxyService = new WizdomCorsProxyService(() => {}, window["WizdomCorsProxyState"]);
            }

            var wizdomWebApiServiceFactory = new WizdomWebApiServiceFactory(wizdomCorsProxyServiceFactory, this.WizdomContext, this.spContext.pageContext.site.absoluteUrl, aadHttpClientFactory);
            this.WizdomWebApiService = await wizdomWebApiServiceFactory.Create();

            await Promise.all([translationServicePromise, configurationPromise]);
        } catch(ex) {
            if(console.error != null)
                console.error("wizdom-intranet/services initializing error", ex);            
        }
        return;        
    }
}