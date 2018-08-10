import { IWizdomWebApiService, IWizdomWebApiServiceState } from "./webapi.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxyService } from "../corsproxy/corsproxy.interfaces";

// max 50 requests/min
const requestRateLimitCount = 30;
const requestRateLimitTimeout = 60*1000;

export class WizdomWebApiService implements IWizdomWebApiService {    
    private corsProxy : IWizdomCorsProxyService;

    constructor(private spHostUrl: string, private state: IWizdomWebApiServiceState, private corsProxyFac: IWizdomCorsProxyServiceFactory) {  
        if(this.state.corsProxyReady == null) // null = unknown/initial state
            this.initCorsProxy(false);
    }
    private initCorsProxy(recreate : boolean){
        this.state.corsProxyReady = false; // false = "creating"
        this.corsProxy = this.corsProxyFac.Create(recreate);
        this.corsProxy.AddHandler("WizdomCorsProxySuccess", (message) => {
            this.state.corsProxyReady = true;
            for (var i = 0; i < this.state.deferredQueue.length; i++) {
                this.makeRequest.apply(this, this.state.deferredQueue[i]);
            }
            this.state.deferredQueue = [];
        });
        this.corsProxy.AddHandler("RequestSuccess", (message) => {
            this.state.requestQueue[message.requestIndex].success(message.result);
            this.state.requestQueue[message.requestIndex] = null; // cleanup
        });
        this.corsProxy.AddHandler("RequestFailed", (message) => {
            this.state.requestQueue[message.requestIndex].fail(message.result);
            this.state.requestQueue[message.requestIndex] = null; // cleanup
        });
        this.corsProxy.AddHandler("TokenExpired", (message) => {
            console.log("Token expired");
            if(this.state.corsProxyReady)
            {
                // this.state.corsProxyReady = false;
                if(!this.state.reCreateIframeTimer){
                    console.log("Recreate iframe");
                    this.initCorsProxy(true);
    
                    this.state.reCreateIframeTimer = setTimeout(() => { // this will block all token expires for the next 60 sec, to prevent DDOS
                        this.state.reCreateIframeTimer = null;
                        // if the corsproxy still isnt ready after 60 sec, try again. Wizdom is probably not responding, maybe due to updates
                        if(!this.state.corsProxyReady)
                        {
                            console.log("Still no valid iframe after 60 sec, try again... ");
                            this.initCorsProxy(true);
                        }
                    }, 60*1000);
                }
            } 

            // queue up the request again
            var request = this.state.requestQueue[message.requestIndex];
            this.makeRequest(request.url, request.success, request.fail, request.method, request.data);
            this.state.requestQueue[message.requestIndex] = null; // cleanup
        });
    }

    public makeRequest(url: string, success: Function, fail: Function, method: string, data: any): void {                 
        if (!this.state.corsProxyReady) { // corsproxy not ready yet. Queue up the requests
            console.info("Queued request to: " + url);
            this.state.deferredQueue.push([url, success, fail, method, data]);
        }
        else {
            console.info("Sending request to: " + url);
            var fullUrl = url + (url.indexOf("?") > 0 ? "&" : "?");
            fullUrl += "SPHostUrl=" + this.spHostUrl;
            if(fullUrl[0] != "/")
                fullUrl = "/" + fullUrl;

            this.state.requestIndex++;
            this.state.requestQueue[this.state.requestIndex] = { success, fail, method, url, data };
            if(this.state.requestRateLimitCounter<requestRateLimitCount)
            {
                this.state.requestRateLimitCounter++;
                setTimeout(() => {
                    this.state.requestRateLimitCounter--;
                }, requestRateLimitTimeout);
                this.corsProxy.Message({
                    method: method,
                    url: fullUrl,
                    requestIndex: this.state.requestIndex,
                    data: data
                });
            }
            else
            {
                console.error("Corsproxy request ratelimit exceeded. More than " + requestRateLimitCount + " was made over a period of " + (requestRateLimitTimeout/1000) + " seconds");
                fail("Corsproxy request ratelimit exceeded");
            }

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