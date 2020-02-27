import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService } from "./corsproxy.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxySharedState } from "./corsproxy.interfaces";
import { WizdomCorsProxyService } from "./corsproxy.service";

const msBeforeAutorefreshOfExpiringToken = 2*60*1000; // to min before token expires, refresh it
export class WizdomCorsProxyServiceFactory implements IWizdomCorsProxyServiceFactory {
    private frameService: IWizdomCorsProxyService;
    private frameWindow: IWizdomCorsProxyIframe;

    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {
        this.addEventListeners();   
    }

    GetOrCreate(recreate: boolean = false) : IWizdomCorsProxyService {
        this.frameWindow = this.getOrCreateIFrame(recreate);

        this.frameService = this.frameService || new WizdomCorsProxyService(this.sendMessage.bind(this), this.getCorsProxySharedState());
            
        return this.frameService;
    }

    private endsWith(str: string | any[], suffix: any) : boolean {
        // using this endswith method to support IE
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    private getOrCreateIFrame(recreate: boolean = false) : IWizdomCorsProxyIframe {     
        if(window["WizdomCorsProxy"] == null || recreate) {
            var corsProxyIframe = document.createElement("iframe");
            corsProxyIframe.style.display = "none";
            
            var appUrl = this.endsWith(this.context.appUrl, "/") ? this.context.appUrl : this.context.appUrl + "/";
            corsProxyIframe.src = this.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.context.clientId + "&redirect_uri=" + appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26isModern=true%26userLoginName=" + encodeURIComponent(this.userLoginName);            

            let appredirectDone = false;
            let hasRetried = false;
            let onloadFunc = (ev: Event) => {
                
                if(!appredirectDone) {
                    appredirectDone = true;
                }
                else if(!window["WizdomCorsProxyState"].session) {
                    // If the frame finished loading but the state hasn't been set it's probably stuck on an error page
                    if(hasRetried) {
                        this.corsproxyFailure();
                    }
                    else {
                        hasRetried = true;
                        setTimeout(onloadFunc, 10);
                    }
                }
            };
            corsProxyIframe.onload = onloadFunc;
            
            corsProxyIframe.onerror = (ev: Event) => {
                this.corsproxyFailure();
            }

            document.body.appendChild(corsProxyIframe);
       
            window["WizdomCorsProxy"] = corsProxyIframe;
        }
        return window["WizdomCorsProxy"]["contentWindow"];
    }
    private corsproxyFailure() {
        window["WizdomCorsProxyState"].corsProxyFailed = true;
        this.frameService.HandleMessage({command: "WizdomCorsProxyFailed"});
    }

    private addEventListeners(){
        if (typeof window.addEventListener != 'undefined')
            window.addEventListener('message', this.postMessageHandler.bind(this), false);
        else if (typeof window["attachEvent"] != 'undefined')
            window["attachEvent"]('onmessage', this.postMessageHandler.bind(this));
    }

    private sendMessage(message: any) {
        this.frameWindow.postMessage(JSON.stringify(message), "*");
    }
    
    private queueTokenRefresh(msLeftOnToken){
        if(msLeftOnToken<msBeforeAutorefreshOfExpiringToken)
        {
            console.log("token will expire soon, refresh it");
            this.frameService.HandleMessage({command: "TokenExpired"});
        }
        else
        {
            console.log("token will automatically refresh in " + (msLeftOnToken-msBeforeAutorefreshOfExpiringToken) + "ms");
            setTimeout(() => {
                console.log("token will expire in " + msBeforeAutorefreshOfExpiringToken + " ms, refresh it");
                this.frameService.HandleMessage({command: "TokenExpired"});
            }, msLeftOnToken-msBeforeAutorefreshOfExpiringToken);
        }
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
                this.queueTokenRefresh(message.msLeftOnToken);
            } else if (message.command === "WizdomCorsProxyFailed") {
                this.corsproxyFailure();
                return;
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