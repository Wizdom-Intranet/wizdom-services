import { IWizdomCorsProxyService, IWizdomCorsProxyIframe, IWizdomCorsProxySharedState } from "../corsproxy/corsproxy.interfaces";

export class WizdomCorsProxyService implements IWizdomCorsProxyService {
    
    private handlers: any = {};

    constructor(private messageDelegate: (message: any) => void, public corsProxyState: IWizdomCorsProxySharedState) {  
        
    }

    Message(message: any): void {
        this.messageDelegate(message);
    }

    HandleMessage(message: any): void {
        if (message.command === "WizdomCorsProxySuccess") {            
            this.corsProxyState = window["WizdomCorsProxyState"];
        }

        if (message.command === "WizdomCorsProxyFailed" && !window["WizdomCorsProxyState"].session) {            
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