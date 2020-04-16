import { IWizdomWebApiService, IWizdomWebApiServiceState, WebApiErrorType } from "./webapi.interfaces";
import { IWizdomCorsProxyServiceFactory, IWizdomCorsProxyService } from "../corsproxy/corsproxy.interfaces";
import { AadHttpClient, IHttpClientOptions } from "@microsoft/sp-http";


// max 60 requests/min
const requestRateLimitCount = 300;
const requestRateLimitTimeout = 5*60*1000;

export class WizdomAADWebApiService implements IWizdomWebApiService {

    constructor(private spHostUrl: string, private appUrl: string, private state: IWizdomWebApiServiceState, private httpClient: AadHttpClient) {}

    public async makeRequest(url: string, method: string, data?: any): Promise<any> {
            console.info(`[WizdomWebApi] Sending ${method} request to: ${url}`);
            
            const isExternalRequest = url.indexOf('://') < 10 && url.indexOf('://') >= 0;

            let parsedUrl = new URL(isExternalRequest ? url : this.appUrl + url);

            parsedUrl.searchParams.append("SPHostUrl", this.spHostUrl);

            // rateLimit is only for get requests
            if(this.state.requestRateLimitCounter<requestRateLimitCount || method != "GET")
            {
                if(method == "GET")
                {
                    this.state.requestRateLimitCounter++;
                    setTimeout(() => {
                        this.state.requestRateLimitCounter--;
                    }, requestRateLimitTimeout);
                }
                return await (await this.httpClient.fetch(parsedUrl.toString(), AadHttpClient.configurations.v1, {
                    method: method, 
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })).text().then(text => text ? JSON.parse(text) : null);
            }
            else
            {
                console.error("[WizdomWebApi] Request ratelimit exceeded. More than " + requestRateLimitCount + " was made over a period of " + (requestRateLimitTimeout/1000) + " seconds");
                throw {errorType: WebApiErrorType.RateLimitExeeded, message: "Request ratelimit exceeded"};
            }

        }


    public async Get(url: string): Promise<any> {
        return await this.makeRequest(url, "GET");
    }
    public async Delete(url: string): Promise<any> {
        return await this.makeRequest(url, "DELETE");
    }
    public async Post(url: string, data: any): Promise<any> {
        return await this.makeRequest(url, "POST", data);
    }
    public async Put(url: string, data: any): Promise<any> {
        return await this.makeRequest(url, "PUT", data);
    }
}