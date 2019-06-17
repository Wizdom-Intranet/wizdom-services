import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomWebApiService, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { WizdomWebApiService } from "./webapi.service";
import { IWizdomCorsProxyServiceFactory } from "../corsproxy/corsproxy.interfaces";

export class WizdomWebApiServiceFactory {
    constructor(private corsProxyFactory: IWizdomCorsProxyServiceFactory, private spHostUrl: string) {                
    }

    Create() : IWizdomWebApiService {                        
        return window["WizdomWebApiService"] = new WizdomWebApiService(this.spHostUrl, this.getWebApiSharedState(), this.corsProxyFactory);
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