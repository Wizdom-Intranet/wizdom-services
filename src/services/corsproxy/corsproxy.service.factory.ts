import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService } from "./corsproxy.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxySharedState } from "./corsproxy.interfaces";
import { WizdomCorsProxyService } from "./corsproxy.service";

export class WizdomCorsProxyServiceFactory implements IWizdomCorsProxyServiceFactory {
    private frameService: IWizdomCorsProxyService;

    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {
        this.addEventListeners();   
    }

    Create(recreate: boolean = false) : IWizdomCorsProxyService {
        let frame = this.getOrCreateIFrame(recreate);
        this.frameService = new WizdomCorsProxyService(frame, this.getCorsProxySharedState());

        return this.frameService;
    }

    private getOrCreateIFrame(recreate: boolean = false) : IWizdomCorsProxyIframe {     
        if(window["WizdomCorsProxy"] == null || recreate) {
            console.time("corsproxy ready"); // start timer for corsproxy
            var corsProxyIframe = document.createElement("iframe");
            corsProxyIframe.style.display = "none";
            
            var appUrl = this.context.appUrl.endsWith("/") ? this.context.appUrl : this.context.appUrl + "/";
            corsProxyIframe.src = this.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.context.clientId + "&redirect_uri=" + appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26userLoginName=" + encodeURIComponent(this.userLoginName);            

            document.body.appendChild(corsProxyIframe);
       

            window["WizdomCorsProxy"] = corsProxyIframe;
        }
        return window["WizdomCorsProxy"]["contentWindow"];
    }

    private addEventListeners(){
        if (typeof window.addEventListener != 'undefined')
            window.addEventListener('message', this.postMessageHandler.bind(this), false);
        else if (typeof window["attachEvent"] != 'undefined')
            window["attachEvent"]('onmessage', this.postMessageHandler.bind(this));
    }
    
    private postMessageHandler(e) {        
        try {            
            var message = JSON.parse(e.data);
            if (!message.command)
                return;
            
            this.frameService.HandleMessage(message);
            if (message.command === "WizdomCorsProxySuccess") {
                console.timeEnd("corsproxy ready");

                window["WizdomCorsProxyState"].session = message.session;
                window["WizdomCorsProxyState"].msLeftOnToken = message.msLeftOnToken;
                window["WizdomCorsProxyState"].allWizdomRoles = message.allWizdomRoles;
                window["WizdomCorsProxyState"].rolesForCurrentUser = message.rolesForCurrentUser;
                window["WizdomCorsProxyState"].upgradeInProgress = message.upgradeInProgress;

            } else if (message.command === "WizdomCorsProxyFailed") {
                alert("WizdomCorsProxyFailed");
            } else if (message.command === "TokenExpired") {
                console.log("got token expired");
                this.Create(true);
            }
        } catch (ex) {
            //console.log("wizdom postmessage error", e.data, ex);
        }
    }

    private getCorsProxySharedState() {
        return window["WizdomCorsProxyState"] = window["WizdomCorsProxyState"] || {            
            session: "", 
            msLeftOnToken: 0, 
            allWizdomRoles: [], 
            rolesForCurrentUser: [], 
            upgradeInProgress: false
        } as IWizdomCorsProxySharedState; 
    }
}