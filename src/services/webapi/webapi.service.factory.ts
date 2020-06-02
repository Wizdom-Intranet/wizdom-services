import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomWebApiService, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { WizdomWebApiService } from "./webapi.service";
import { IWizdomCorsProxyServiceFactory } from "../corsproxy/corsproxy.interfaces";
import { WizdomAADWebApiService } from "./aad-webapi.service";
import { AadHttpClient } from "@microsoft/sp-http";

export class WizdomWebApiServiceFactory {
    constructor(private corsProxyFactory: IWizdomCorsProxyServiceFactory, private wizdomContext: IWizdomContext, private spHostUrl: string, private aadHttpClientFactory: (clientId)=>Promise<AadHttpClient>) {                
    }

    async Create() : Promise<IWizdomWebApiService> {
        if(window["WizdomWebApiService"]) {
            return window["WizdomWebApiService"];
        }
        if(this.wizdomContext && this.wizdomContext.isWizdomSaaS) {
            return window["WizdomWebApiService"] = new WizdomAADWebApiService(this.spHostUrl, this.wizdomContext.appUrl, this.getWebApiSharedState(), await this.aadHttpClientFactory(this.wizdomContext.clientId));
        }
        else {
            return window["WizdomWebApiService"] = new WizdomWebApiService(this.spHostUrl, this.getWebApiSharedState(), this.corsProxyFactory);
        }
    }

    private getWebApiSharedState() {
        return window["WizdomWebApiServiceState"] = window["WizdomWebApiServiceState"] || {            
            deferredQueue: [],
            requestQueue: {},
            requestIndex: 0,
            reCreateIframeTimer : null,
            corsProxyReady : null,
            eventListenersAttached: false,
            requestRateLimitCounter: 0,
            corsProxyFailed: false,
        } as IWizdomWebApiServiceState; 
    }   
}