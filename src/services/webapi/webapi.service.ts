import { IWizdomWebApiService, IWizdomWebApiServiceConfig } from "./webapi.interfaces";

interface IWizdomWebApiServiceState {
    corsProxyIframe: object;
    deferredQueue: IArguments[];
    requestQueue: object;
    requestIndex: number;
}

/// Globally shared state
function getWizdomWebApiServiceState() {
    return window["WizdomWebApiServiceState"] = window["WizdomWebApiServiceState"] || {
        corsProxyIframe: null,
        deferredQueue: [],
        requestQueue: {},
        requestIndex: 0,
        webapiService: null,
    } as IWizdomWebApiServiceState; 
}

export class WizdomWebApiService implements IWizdomWebApiService {    
    constructor(private config: IWizdomWebApiServiceConfig) {             
        var state = getWizdomWebApiServiceState();
        if(state.corsProxyIframe == null)
            state.corsProxyIframe = this.createIFrame();
        if(state.webapiService == null)
            state.webapiService = this;
    }    
    
    private buildFullUrl(url) {
        url += url.indexOf("?") > 0 ? "&" : "?";
        url += "SPHostUrl=" + this.config.spHostUrl;
        return "/" + url;
    }
    private makeRequest(url, callback, method, data) {        
        var state = getWizdomWebApiServiceState();
        if (state.deferredQueue != null) { // corsproxy not ready yet. Queue up the requests
            //console.info("queued request to: " + url);
            state.deferredQueue.push(arguments);
        }
        else {
            //console.info("sending request to: " + url);
            state.requestIndex++;
            state.requestQueue[state.requestIndex] = callback;
            state.corsProxyIframe["contentWindow"].postMessage(JSON.stringify({
                method: method,
                url: state.webapiService.buildFullUrl(url),
                requestIndex: state.requestIndex,
                data: data
            }), "*");
        }
    }
    private postMessageHandler(e) {        
        try {
            var state = getWizdomWebApiServiceState();
            var message = JSON.parse(e.data);
            if (!message.command)
                return;

            if (message.command === "WizdomCorsProxySuccess") {
                console.timeEnd("corsproxy ready");
                var queue = state.deferredQueue;
                state.deferredQueue = null;
                for (var i = 0; i < queue.length; i++) {
                    state.webapiService.makeRequest.apply(null, queue[i]);
                }
            } else if (message.command === "WizdomCorsProxyFailed") {
                alert("WizdomCorsProxyFailed");
            } else if (message.command === "RequestSuccess") {
                //console.info("request success", message);
                state.requestQueue[message.requestIndex](message.result);
            } else if (message.command === "TokenExpired") {
                console.log("got token expired");
            }
        } catch (ex) {
            //console.log("wizdom postmessage error", e.data, ex);
        }
    }

    private createIFrame(): any {
        console.time("corsproxy ready"); // start timer for corsproxy

        var corsProxyIframe = document.createElement("iframe");
        corsProxyIframe.style.display = "none";

        var url = this.config.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.config.clientId + "&redirect_uri=" + this.config.appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26userLoginName=" + encodeURIComponent(this.config.userLoginName);
        corsProxyIframe.src = url;

        document.body.appendChild(corsProxyIframe);

        if (typeof window.addEventListener != 'undefined')
            window.addEventListener('message', this.postMessageHandler, false);
        else if (typeof window["attachEvent"] != 'undefined')
            window["attachEvent"]('onmessage', this.postMessageHandler);

        return corsProxyIframe;
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