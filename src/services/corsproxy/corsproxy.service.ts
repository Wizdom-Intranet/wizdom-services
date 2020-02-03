import { IWizdomCorsProxyService, IWizdomCorsProxyIframe, IWizdomCorsProxySharedState } from "../corsproxy/corsproxy.interfaces";

export class WizdomCorsProxyService implements IWizdomCorsProxyService {
    
    private handlers: any = {};

    constructor(private iframe: IWizdomCorsProxyIframe, public corsProxyState: IWizdomCorsProxySharedState) {  
        
    }

    Message(message: any): void {
        this.iframe.postMessage(JSON.stringify(message), "*");
    }

    HandleMessage(message: any): void {
        let handlers = this.handlers[message.command];

        if (message.command === "WizdomCorsProxySuccess") {            
            this.corsProxyState = window["WizdomCorsProxyState"];
        }

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