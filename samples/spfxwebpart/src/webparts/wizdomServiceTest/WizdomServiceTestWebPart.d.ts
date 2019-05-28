import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration } from '@microsoft/sp-webpart-base';
export interface IWizdomServiceTestWebPartProps {
    description: string;
}
export default class WizdomServiceTestWebPart extends BaseClientSideWebPart<IWizdomServiceTestWebPartProps> {
    private wizdomServices;
    protected onInit(): Promise<void>;
    render(): Promise<void>;
    protected readonly dataVersion: Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
