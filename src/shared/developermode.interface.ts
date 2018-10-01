import { IWizdomContext } from "../services/context/context.interfaces";

export interface IWizdomDeveloperMode {    
    wizdomContext: IWizdomContext;
    nocache: boolean;
    errorMissingTranslations: boolean; 
}