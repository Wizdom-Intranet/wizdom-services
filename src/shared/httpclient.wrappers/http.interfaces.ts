export interface IHttpClient {
    get(url: string): Promise<IHttpClientResponse>;
}

export interface IHttpClientResponse {
    ok: boolean;
    text(): Promise<string>;
    json(): Promise<any>;
}