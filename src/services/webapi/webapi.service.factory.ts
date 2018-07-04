import { IWizdomContext } from "../context/context.interfaces";
import { IWizdomWebApiService, IWizdomWebApiServiceConfig } from "./webapi.interfaces";
import { WizdomWebApiService } from "./webapi.service";


export class WizdomWebApiServiceFactory {        
    constructor(private context: IWizdomContext, private spHostUrl: string, private userLoginName: string ) {
        
    }

    Create() : IWizdomWebApiService {        
        var options = {
            appUrl: this.context.appUrl,
            clientId: this.context.clientId,
            userLoginName: this.userLoginName,
            spHostUrl: this.spHostUrl,
        } as IWizdomWebApiServiceConfig;            

        return new WizdomWebApiService(options);        
    }
}