export interface IWizdomCorsProxyServiceFactory {
    GetOrCreate(recreate: boolean): IWizdomCorsProxyService;
}

export interface IWizdomCorsProxyService {
    corsProxyState: IWizdomCorsProxySharedState;
    Message(message: any): void;
    HandleMessage(message: any): void;
    AddHandler(event: string, handler: Function): void;
}

export interface IWizdomCorsProxyIframe {
    postMessage(message: string, targetOrigin: string);
}

export interface IWizdomCorsProxySharedState {
    session: string;
    msLeftOnToken: Number;
    allWizdomRoles: Array<string>;
    rolesForCurrentUser: Array<string>;    
    upgradeInProgress: boolean;
    currentUserLanguage: string;
    corsProxyFailed: boolean;
}

export type IFrameFunction = (recreate?: boolean) => IWizdomCorsProxyIframe;