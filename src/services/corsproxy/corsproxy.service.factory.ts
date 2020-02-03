import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService } from "./corsproxy.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxySharedState } from "./corsproxy.interfaces";
import { WizdomCorsProxyService } from "./corsproxy.service";

export class WizdomCorsProxyServiceFactory implements IWizdomCorsProxyServiceFactory {
    private frameService: IWizdomCorsProxyService;

    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {
        this.addEventListeners();   
    }

    GetOrCreate(recreate: boolean = false) : IWizdomCorsProxyService {
        var frame = this.getOrCreateIFrame(recreate);
        this.frameService = new WizdomCorsProxyService(frame, this.getCorsProxySharedState());
        return this.frameService;
    }

    private endsWith(str: string | any[], suffix: string | any[]) : boolean {
        // using this endswith method to support IE
        return str.indexOf((suffix as any), str.length - suffix.length) !== -1;
    }

    private getOrCreateIFrame(recreate: boolean = false) : IWizdomCorsProxyIframe {     
        if(window["WizdomCorsProxy"] == null || recreate) {
            var corsProxyIframe = document.createElement("iframe");
            corsProxyIframe.style.display = "none";
            
            var appUrl = this.endsWith(this.context.appUrl, "/") ? this.context.appUrl : this.context.appUrl + "/";
            corsProxyIframe.src = this.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.context.clientId + "&redirect_uri=" + appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26isModern=true%26userLoginName=" + encodeURIComponent(this.userLoginName);            

            corsProxyIframe.onload = (ev: Event) => {
                if(!window["WizdomCorsProxyState"].session) {
                    // If the frame finished loading but the state hasn't been set it's probably stuck on an error page
                    window["WizdomCorsProxyState"].corsProxyFailed = true;
                }
            }
            corsProxyIframe.onerror = (ev: Event) => {
                    window["WizdomCorsProxyState"].corsProxyFailed = true;
            }

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
    
    private postMessageHandler(e: { data: string; }) {        
        try {            
            var message = JSON.parse(e.data);
            if (!message.command)
                return;
            if (message.command === "WizdomCorsProxySuccess") {

                window["WizdomCorsProxyState"].session = message.session;
                window["WizdomCorsProxyState"].msLeftOnToken = message.msLeftOnToken;
                window["WizdomCorsProxyState"].allWizdomRoles = message.allWizdomRoles;
                window["WizdomCorsProxyState"].rolesForCurrentUser = message.rolesForCurrentUser;
                window["WizdomCorsProxyState"].upgradeInProgress = message.upgradeInProgress;

            } else if (message.command === "WizdomCorsProxyFailed") {
                window["WizdomCorsProxyState"].corsProxyFailed = true;
                alert("WizdomCorsProxyFailed");
            }
            
            this.frameService.HandleMessage(message);

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
            upgradeInProgress: false,
            corsProxyFailed: false
        } as IWizdomCorsProxySharedState; 
    }
}