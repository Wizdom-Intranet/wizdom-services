export default class LocalStorageFake {
    private cache = {};

    public getItem(key: string) : any {                
        return this.cache[key] || null;
    }

    public setItem(key: string, value: any) : void {        
        this.cache[key] = value;
    }

    public clear() {
        this.cache = {};
    }

    public getItemContainingKey(key: string){
        var result;
        Object.keys(this.cache).forEach(prop => {
            if(prop.endsWith(key)){
                result = this.cache[prop];
                return;
            }            
        });
        return result;
    }
}