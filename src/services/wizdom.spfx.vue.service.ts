import { WizdomSpfxServices } from "../services/wizdom.spfx.service";

export class WizdomSpfxVueServices extends WizdomSpfxServices {   

    async InitVueAsync(Vue: any, options: any) : Promise<void> {
        await super.InitAsync(options);
        
        if(Vue){
            Vue.filter("translate", (value) => {              
                if(this.TranslationService)
                    return this.TranslationService.translate(value);
                throw "Wizdom Translation Service not initialized";
            }); 
        }

        return Promise.resolve();
    }
}