import { IWizdomWebApiService, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { IWizdomCorsProxyService } from "../corsproxy/corsproxy.interfaces";

export class WizdomWebApiService implements IWizdomWebApiService {    
    
    constructor(private spHostUrl: string, private state: IWizdomWebApiServiceState, private corsProxy: IWizdomCorsProxyService) {  
        corsProxy.AddHandler("WizdomCorsProxySuccess", (message) => {
            this.state.corsProxyReady = true;
            for (var i = 0; i < this.state.deferredQueue.length; i++) {
                this.makeRequest.apply(this, this.state.deferredQueue[i]);
            }
            this.state.deferredQueue = [];
        });
        corsProxy.AddHandler("RequestSuccess", (message) => {
            this.state.requestQueue[message.requestIndex].success(message.result);
        });
        corsProxy.AddHandler("RequestFailed", (message) => {
            this.state.requestQueue[message.requestIndex].fail(message.result);
        });
    }
        
    public makeRequest(url: string, success: Function, fail: Function, method: string, data: any): void {                 
        if (!this.state.corsProxyReady) { // corsproxy not ready yet. Queue up the requests
            //console.info("queued request to: " + url);
            this.state.deferredQueue.push([url, success, fail, method, data]);
        }
        else {
            //console.info("sending request to: " + url);
            url += url.indexOf("?") > 0 ? "&" : "?";
            url += "SPHostUrl=" + this.spHostUrl;
            if(url[0] != "/")
                url = "/" + url;

            this.state.requestIndex++;
            this.state.requestQueue[this.state.requestIndex] = { success: success, fail: fail };
            this.corsProxy.Message({
                method: method,
                url: url,
                requestIndex: this.state.requestIndex,
                data: data
            });
        }
    }

    public Get(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, reject, "GET", null);
        });
    }
    public Delete(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, reject, "DELETE", null);
        });
    }
    public Post(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, reject, "POST", data);
        });
    }
    public Put(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.makeRequest(url, resolve, reject, "PUT", data);
        });
    }
}