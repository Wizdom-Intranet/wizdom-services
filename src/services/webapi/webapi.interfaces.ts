export interface IWizdomWebApiService {
    Get(url: string): Promise<any>;
    Delete(url: string): Promise<any>;
    Post(url: string, data: any): Promise<any>;
    Put(url: string, data: any): Promise<any>; 
}

export interface IWizdomWebApiServiceConfig{
    spHostUrl: string;
    userLoginName: string;
    appUrl: string;
    clientId: string;
}
