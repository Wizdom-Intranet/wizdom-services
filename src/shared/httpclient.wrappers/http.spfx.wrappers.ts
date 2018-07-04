import { IHttpClient, IHttpClientResponse } from "./http.interfaces";
import { HttpClient, HttpClientResponse, SPHttpClient } from "@microsoft/sp-http";

export class SpfxHttpClient implements IHttpClient {
    constructor(private httpClient: any) {        
        
    }

    get(url: string): Promise<IHttpClientResponse> {
        return this.httpClient.get(url, HttpClient.configurations.v1).then((response) => {
            return new SpfxHttpClientResponse(response);
        })        
    }
}

export class SpfxSpHttpClient implements IHttpClient {
    constructor(private httpClient: SPHttpClient) {        
        
    }

    get(url: string): Promise<IHttpClientResponse> {
        return this.httpClient.get(url, SPHttpClient.configurations.v1).then((response) => {
            return new SpfxHttpClientResponse(response);
        });
    }
}

export class SpfxHttpClientResponse implements IHttpClientResponse {
 
    ok: boolean;
    
    constructor(private httpClientResponse: HttpClientResponse) {        
        this.ok = httpClientResponse.ok;
        
    }

    text(): Promise<string> {
        return this.httpClientResponse.text();
    }    

    json(): Promise<any> {
        return this.httpClientResponse.json();
    }
}
