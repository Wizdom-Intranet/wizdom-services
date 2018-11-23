export interface IWizdomLocalstorageCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number, refreshInMilliseconds: number, refreshDelayInMilliseconds: number): Promise<T>;    
}

export interface IWizdomPageViewCache {    
    ExecuteCached<T>(key: string, func: Function, expiresInMilliseconds: number) : T;
}

export interface IWizdomTimestamps {
    get(key?: string) : Promise<number>;
    addMappings(key: string, ...mappings: string[]) : void;
}
export interface IWizdomTimestampsResolver {
    resolve(timestamps: {[key:string]:number}) : void;
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
