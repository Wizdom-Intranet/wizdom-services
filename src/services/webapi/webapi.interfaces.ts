export interface IWizdomWebApiService {
    Get(url: string): Promise<any>;
    Delete(url: string): Promise<any>;
    Post(url: string, data: any): Promise<any>;
    Put(url: string, data: any): Promise<any>; 
}

export interface IWizdomWebApiServiceState {    
    deferredQueue: IArguments[];
    requestQueue: object;
    requestIndex: number;
    eventListenersAttached: boolean;
    corsProxyReady: boolean
}

export type IFrameFunction = (recreate?: boolean) => IWizdomCorsProxyIframe;

export interface IWizdomCorsProxyIframe {
    postMessage(message: string, targetOrigin: string);
}