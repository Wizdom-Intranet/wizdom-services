import { IWizdomCorsProxyService, IWizdomCorsProxyIframe, IWizdomCorsProxySharedState } from "../corsproxy/corsproxy.interfaces";

export class WizdomCorsProxyService implements IWizdomCorsProxyService {
    
    private handlers: any = {};

    constructor(private iframe: IWizdomCorsProxyIframe, public corsProxyState: IWizdomCorsProxySharedState) {  
        
    }

    RefreshFrame(frame: IWizdomCorsProxyIframe) {
        this.iframe = frame;
    }

    Message(message: any): void {
        this.iframe.postMessage(JSON.stringify(message), "*");
    }

    HandleMessage(message: any): void {
        if (message.command === "WizdomCorsProxySuccess") {            
            this.corsProxyState = window["WizdomCorsProxyState"];
        }

        if (message.command === "WizdomCorsProxyFailed") {            
            this.corsProxyState = window["WizdomCorsProxyState"];
        }

        let handlers = this.handlers[message.command];
        if(!handlers)
            return;

        for (let i = 0; i < handlers.length; i++){
            handlers[i](message);
        }
    }

    AddHandler(event: string, handler: Function): void {
        this.handlers[event] = this.handlers[event] || [];
        this.handlers[event].push(handler);
    }
}