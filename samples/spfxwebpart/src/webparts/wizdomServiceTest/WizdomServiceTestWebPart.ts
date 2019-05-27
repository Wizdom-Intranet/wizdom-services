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

  protected async onInit(): Promise<void> {
    this.wizdomServices = new WizdomSpfxServices(this.context);
    await this.wizdomServices.InitAsync({});    
  }

  public async render(): Promise<void> {    
    if(!this.renderedOnce) {
        // Usage        
        var wizdomConfiguration = this.wizdomServices.WizdomConfiguration;
        var wizdomContext = this.wizdomServices.WizdomContext;
        var wizdomTranslationService = this.wizdomServices.TranslationService;

        this.wizdomServices.Cache.Localstorage.ExecuteCached("Test.Date", () => {
          console.log("Getting new Cached Date");
          return Promise.resolve(new Date());
        }, 5 * 60 * 1000, 2 * 60 * 1000, 10* 1000 ).then(cachedDate => {
          console.log("Cached Date:", cachedDate);
        });
        this.wizdomServices.Cache.Timestamps.Get("timestampConfiguration").then(timestamp => {
          console.log("timestampConfiguration", new Date(timestamp));
        });

        var me = await this.wizdomServices.WizdomWebApiService.Get("api/wizdom/365/principals/me");

        var createdByText = wizdomTranslationService.translate("Created by") + " Wizdom";
        var notTranslatedText = wizdomTranslationService.translate("Dog Cat Sheep");
        this.domElement.innerHTML = `
        <div class="${ styles.wizdomServiceTest }" style="height:500px; overflow:hidden;">
            <div class="${ styles.container }">
            <div class="${ styles.row }">
                <div class="${ styles.column }">
                <span class="${ styles.title }">Wizdom service no framework sample!</span>
                <p class="${ styles.description }">
                    <b>Wizdom Translation</b><br/>
                    Translated: ${createdByText}
                    <br/>
                    Not translated: ${notTranslatedText}
                </p>
                <p class="${ styles.description }">
                    <b>Wizdom Context</b><br/>
                    ${JSON.stringify(wizdomContext)}
                </p>
                <p class="${ styles.description }">
                    <b>Wizdom ApiService Me Request</b><br/>
                    ${JSON.stringify(me)}
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
                PropertyPaneTextField('description', {
                  label: this.wizdomServices.TranslationService.translate(strings.DescriptionFieldLabel)
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
