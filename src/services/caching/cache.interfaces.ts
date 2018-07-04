export interface IWizdomLocalstorageCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number): Promise<T>;    
}

export interface IWizdomPageViewCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : T;
}

export interface IWizdomCache {        
    Localstorage: IWizdomLocalstorageCache;
    PageView: IWizdomPageViewCache;
}

export interface ICacheObject<T> {
    data: T;
    created: string;
}
