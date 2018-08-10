import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomWebApiService, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { WizdomWebApiService } from "./webapi.service";
import { WizdomCorsProxyServiceFactory } from "../corsproxy/corsproxy.service.factory";

export class WizdomWebApiServiceFactory {        
    private corsProxyFactory: WizdomCorsProxyServiceFactory;
    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {        
        this.corsProxyFactory = new WizdomCorsProxyServiceFactory(context, spHostUrl, userLoginName);
    }

    Create() : IWizdomWebApiService {                
        return new WizdomWebApiService(this.spHostUrl, this.getWebApiSharedState(), this.corsProxyFactory);
    }

    private getWebApiSharedState() {
        return window["WizdomWebApiServiceState"] = window["WizdomWebApiServiceState"] || {            
            deferredQueue: [],
            requestQueue: {},
            requestIndex: 0,
            reCreateIframeTimer : null,
            corsProxyReady : null,
            eventListenersAttached: false,
            requestRateLimitCounter: 0
        } as IWizdomWebApiServiceState; 
    }   
}