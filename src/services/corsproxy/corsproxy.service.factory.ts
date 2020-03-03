import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService } from "./corsproxy.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxySharedState } from "./corsproxy.interfaces";
import { WizdomCorsProxyService } from "./corsproxy.service";

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
            
            let hasRetried = false;
            let onloadFunc = (ev: Event) => {
                var iframeIsInSPDomain = false;
                try {
                    iframeIsInSPDomain = !!corsProxyIframe.contentDocument;
                }
                catch(ex) {
                }
                if(iframeIsInSPDomain){
                    if(!/appredirect/ig.test(corsProxyIframe.contentWindow.location.href)) {
                        // If the frame finished loading and we can access the content docuemnt set it's probably stuck on an error page on the sharepoint domain
                        if(hasRetried) {
                            this.corsproxyFailure();
                        }
                        else {
                            hasRetried = true;
                            setTimeout(onloadFunc, 1000);
                        }
                    }
                }
            };
            corsProxyIframe.onload = onloadFunc;

            document.body.appendChild(corsProxyIframe);
       
            window["WizdomCorsProxy"] = corsProxyIframe;
        }
        return window["WizdomCorsProxy"]["contentWindow"];
    }
    private corsproxyFailure() {
        console.error("Corsproxy failed to initialize");
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
                window["WizdomCorsProxyState"].corsProxyFailed = false;

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