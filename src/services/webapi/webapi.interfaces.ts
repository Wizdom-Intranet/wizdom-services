export interface IWizdomWebApiService {
    Get(url: string): Promise<any>;
    Delete(url: string): Promise<any>;
    Post(url: string, data: any): Promise<any>;
    Put(url: string, data: any): Promise<any>; 
}

export interface IWizdomWebApiServiceState {    
    deferredQueue: any[];
    requestQueue: object;
    requestIndex: number;
    eventListenersAttached: boolean;
    corsProxyReady?: boolean;
    reCreateIframeTimer : NodeJS.Timer;
    requestRateLimitCounter : number;
}