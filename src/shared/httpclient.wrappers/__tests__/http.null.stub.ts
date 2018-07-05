import { IHttpClient, IHttpClientResponse } from "../http.interfaces";

export class HttpClientNullStub implements IHttpClient {
    get(url: string): Promise<IHttpClientResponse> {
        throw "get called un HttpClientNullStub";
    }
}