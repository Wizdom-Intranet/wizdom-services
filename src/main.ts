export { WizdomSpfxServices } from "./services/wizdom.spfx.service";
export { WizdomSpfxVueServices } from "./services/wizdom.spfx.vue.service";
export { IWizdomCache, IWizdomLocalstorageCache, IWizdomPageViewCache } from "./services/caching/cache.interfaces";
export { IWizdomContext } from "./services/context/context.interfaces";
export { IWizdomWebApiService, WebApiErrorType } from "./services/webapi/webapi.interfaces";
export { IWizdomTranslationService } from "./services/translations/translation.interfaces";
export { IHttpClient, IHttpClientResponse } from "./shared/httpclient.wrappers/http.interfaces";


export { WizdomWebApiServiceFactory } from "./services/webapi/webapi.service.factory";
export { WizdomCorsProxyServiceFactory } from "./services/corsproxy/corsproxy.service.factory";