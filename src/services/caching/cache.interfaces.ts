export interface IWizdomLocalstorageCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number): Promise<T>;    
}

export interface IWizdomPageViewCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : T;
}

export interface IWizdomTimestamps {
    Get(key?: string) : Promise<number>;
    AddMappings(key: string, ...mappings: string[]) : void;
}
export interface IWizdomTimestampsResolver {
    Resolve(timestamps: {[key:string]:number}) : void;
}
export interface IWizdomCache {        
    Localstorage: IWizdomLocalstorageCache;
    PageView: IWizdomPageViewCache;
    Timestamps: IWizdomTimestamps;
    TimestampsResolver: IWizdomTimestampsResolver;
}

export interface ICacheObject<T> {
    data: T;
    created: string;
}
