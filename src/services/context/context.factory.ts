import { IWizdomContext } from "./context.interfaces";
import { IWizdomCache } from "../caching/cache.interfaces";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";
import { IWizdomDeveloperMode } from "../../shared/developermode.interface";
import { AadHttpClient } from "@microsoft/sp-http";

export class WizdomContextFactory {
  private storageEntityContext: IWizdomContext = {
    blobUrl: "",
    appUrl: "",
    clientId: "",
    wizdomdevelopermode: null,
    isWizdomSaaS: false,
    serverContext: null,
  };
  private allPropertiesContext: IWizdomContext;
  constructor(
    private spHttpClient: IHttpClient,
    private cache: IWizdomCache,
    private wizdomdevelopermode: IWizdomDeveloperMode,
    private aadHttpClientFactory: (clientId) => Promise<AadHttpClient>
  ) {}

  async GetWizdomContextAsync(
    siteAbsoluteUrl: string
  ): Promise<IWizdomContext> {
    var expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    var refreshIn = 10 * 60 * 1000; // 10 minutes
    var refreshDelayIn = 3 * 1000; // 3 seconds

    return this.cache.Localstorage.ExecuteCached(
      "Context:" + siteAbsoluteUrl,
      async () => {
        var storageEntityPromise = this.spHttpClient
          .get(
            siteAbsoluteUrl + "/_api/web/GetStorageEntity('wizdom.properties')"
          )
          .then((result) => {
            return result.json().then((json) => {
              if (json.Value) {
                var context: IWizdomContext = JSON.parse(json.Value);
                this.storageEntityContext = context;
              }
            });
          });

        let rootSiteUrl = "";
        const rootSiteUrlArray = siteAbsoluteUrl.split("/");
        rootSiteUrl = rootSiteUrlArray[0] + "//" + rootSiteUrlArray[2];

        var allPropertiesPromise = this.spHttpClient
          .get(
            rootSiteUrl + "/_api/web/AllProperties?$select=wizdom.properties"
          )
          .then((result) => {
            return result.json().then((json) => {
              if (json.wizdom_x002e_properties) {
                var context: IWizdomContext = JSON.parse(
                  json.wizdom_x002e_properties
                );
                this.allPropertiesContext = context;
              }
            });
          });

        await Promise.all([storageEntityPromise, allPropertiesPromise]);

        if (this.allPropertiesContext) {
          if (this.allPropertiesContext.appUrl)
            this.storageEntityContext.appUrl = this.allPropertiesContext.appUrl;
          if (this.allPropertiesContext.blobUrl)
            this.storageEntityContext.blobUrl =
              this.allPropertiesContext.blobUrl;
          if (this.allPropertiesContext.clientId)
            this.storageEntityContext.clientId =
              this.allPropertiesContext.clientId;
          this.storageEntityContext.isWizdomSaaS =
            this.allPropertiesContext.isWizdomSaaS ??
            this.storageEntityContext.isWizdomSaaS;
        }

        if (
          this.storageEntityContext.isWizdomSaaS ||
          this.wizdomdevelopermode?.wizdomContext?.isWizdomSaaS
        ) {
          // Make sure to use the appUrl from wizdomdevelopermode if it's there, otherwise default down the chain till we find something
          // Use local variable to avoid caching the developermode appUrl
          let appUrl =
            this.wizdomdevelopermode?.wizdomContext?.appUrl ??
            this.storageEntityContext.appUrl;
          var clientId =
            this.wizdomdevelopermode?.wizdomContext?.clientId ??
            this.storageEntityContext.clientId;
          if (!clientId || clientId == "") {
            throw "ClientID is missing from tenant properties";
          }
          let httpClient: AadHttpClient = await this.aadHttpClientFactory(
            clientId
          );
          let wizdomInfo: IWizdomContext = await (
            await httpClient.fetch(
              appUrl + "api/wizdom/365/context",
              AadHttpClient.configurations.v1,
              { method: "GET" }
            )
          ).json();

          // Make sure to cache the correct appUrl even if we get something else from the server
          if (this.wizdomdevelopermode?.wizdomContext?.appUrl) {
            wizdomInfo.appUrl = this.storageEntityContext.appUrl;
          }

          this.storageEntityContext = {
            ...this.storageEntityContext,
            ...wizdomInfo,
          };
        }

        // ensure tailing / for app- and bloburl
        if (this.storageEntityContext.blobUrl.substr(-1) != "/")
          this.storageEntityContext.blobUrl =
            this.storageEntityContext.blobUrl + "/";
        if (this.storageEntityContext.appUrl.substr(-1) != "/")
          this.storageEntityContext.appUrl =
            this.storageEntityContext.appUrl + "/";

        return this.storageEntityContext;
      },
      expireIn,
      refreshIn,
      refreshDelayIn
    )
    .then((context) => {
      // Store a global variable
      var wizdomContext = context as IWizdomContext;
      wizdomContext.wizdomdevelopermode = this.wizdomdevelopermode;
      if (this.wizdomdevelopermode && this.wizdomdevelopermode.wizdomContext) {
        wizdomContext = {
          ...wizdomContext,
          ...this.wizdomdevelopermode.wizdomContext,
        };
      }
      window["WizdomContext"] = wizdomContext;
      return wizdomContext;
    });
  }
}
