import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomWebApiService, IWizdomCorsProxyIframe, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { WizdomWebApiService } from "./webapi.service";

export class WizdomWebApiServiceFactory {        
    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {        
    }

    Create() : IWizdomWebApiService {                
        return new WizdomWebApiService(this.spHostUrl, this.getCorsProxySharedState(), this.getOrCreateIFrame.bind(this));
    }

    private getCorsProxySharedState() {
        return window["WizdomWebApiServiceState"] = window["WizdomWebApiServiceState"] || {            
            deferredQueue: [],
            requestQueue: {},
            requestIndex: 0,
            eventListenersAttached: false,
        } as IWizdomWebApiServiceState; 
    }

    private getOrCreateIFrame(recreate: boolean = false) : IWizdomCorsProxyIframe {            
        console.time("corsproxy ready"); // start timer for corsproxy
        if(window["WizdomWebApiIFrame"] == null || recreate) {

            var corsProxyIframe = document.createElement("iframe");
            corsProxyIframe.style.display = "none";
            
            var appUrl = this.context.appUrl.endsWith("/") ? this.context.appUrl : this.context.appUrl + "/";
            corsProxyIframe.src = this.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.context.clientId + "&redirect_uri=" + appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26userLoginName=" + encodeURIComponent(this.userLoginName);            

            document.body.appendChild(corsProxyIframe);
       

            window["WizdomWebApiIFrame"] = corsProxyIframe;
        }
        return window["WizdomWebApiIFrame"]
    }    
}