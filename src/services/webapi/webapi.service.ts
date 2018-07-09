import { IWizdomWebApiService, IWizdomWebApiServiceState, IFrameFunction } from "./webapi.interfaces";

export class WizdomWebApiService implements IWizdomWebApiService {    
    
    constructor(private spHostUrl: string, private state: IWizdomWebApiServiceState, private getOrCreateIFrame: IFrameFunction) {  
        this.getOrCreateIFrame(); // initial creation

        if(!state.eventListenersAttached){
            this.addEventListeners();
            state.eventListenersAttached = true;
        }
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

            if (message.command === "WizdomCorsProxySuccess") {
                console.timeEnd("corsproxy ready");                
                this.state.corsProxyReady = true;
                for (var i = 0; i < this.state.deferredQueue.length; i++) {
                    this.makeRequest.apply(this, this.state.deferredQueue[i]);
                }
                this.state.deferredQueue = [];
            } else if (message.command === "WizdomCorsProxyFailed") {
                alert("WizdomCorsProxyFailed");
            } else if (message.command === "RequestSuccess") {
                //console.info("request success", message);
                this.state.requestQueue[message.requestIndex](message.result);
            } else if (message.command === "TokenExpired") {
                console.log("got token expired");
            }
        } catch (ex) {
            //console.log("wizdom postmessage error", e.data, ex);
        }
    }
        
    public makeRequest(url, callback, method, data) {                 
        if (!this.state.corsProxyReady) { // corsproxy not ready yet. Queue up the requests
            //console.info("queued request to: " + url);
            this.state.deferredQueue.push(arguments);
        }
        else {
            //console.info("sending request to: " + url);
            url += url.indexOf("?") > 0 ? "&" : "?";
            url += "SPHostUrl=" + this.spHostUrl;
            if(url[0] != "/")
                url = "/" + url;

            this.state.requestIndex++;
            this.state.requestQueue[this.state.requestIndex] = callback;
            this.getOrCreateIFrame().postMessage(JSON.stringify({
                method: method,
                url: url,
                requestIndex: this.state.requestIndex,
                data: data
            }), "*");
        }
    }

    public Get(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, "GET", null);
        });
    }
    public Delete(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, "DELETE", null);
        });
    }
    public Post(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, "POST", data);
        });
    }
    public Put(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, "PUT", data);
        });
    }
}