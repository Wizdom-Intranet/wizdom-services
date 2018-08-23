import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './WizdomServiceTestWebPart.module.scss';
import * as strings from 'WizdomServiceTestWebPartStrings';

import { WizdomSpfxServices } from "@wizdom-intranet/services";

export interface IWizdomServiceTestWebPartProps {
  description: string;
}

export default class WizdomServiceTestWebPart extends BaseClientSideWebPart<IWizdomServiceTestWebPartProps> {
    private wizdomServices: WizdomSpfxServices;

  public async render(): Promise<void> {
    // Initialization
    this.wizdomServices = new WizdomSpfxServices(this.context);
    await this.wizdomServices.InitAsync({});

    // Usage
    var wizdomConfiguration = this.wizdomServices.WizdomConfiguration;
    var wizdomContext = this.wizdomServices.WizdomContext
    var wizdomTranslationService = this.wizdomServices.TranslationService;    

    this.wizdomServices.WizdomWebApiService.Get("api/wizdom/365/principals/me").then(result => {        
        alert("Me: " + JSON.stringify(result));
    });

    var createdByText = wizdomTranslationService.translate("Created by") + " Wizdom";

    this.domElement.innerHTML = `
    <div class="${ styles.wizdomServiceTest }" style="height:500px; overflow:hidden;">
        <div class="${ styles.container }">
        <div class="${ styles.row }">
            <div class="${ styles.column }">
            <span class="${ styles.title }">Wizdom service no framework sample!</span>
            <p class="${ styles.description }">
                <b>Wizdom Translation</b><br/>
                ${createdByText}                
            </p>     
            <p class="${ styles.description }">
                <b>Wizdom Context</b><br/>
                ${JSON.stringify(wizdomContext)}
            </p>
            <p class="${ styles.description }">
                <b>Wizdom Configuration</b><br/>                
                ${JSON.stringify(wizdomConfiguration)}                
            </p>              
            </div>
        </div>
        </div>
    </div>`;      
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField(this.wizdomServices.TranslationService.translate('description'), {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
