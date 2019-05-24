# wizdom-services
A list of core service to ease Wizdom development

## Vue.js
Wizdom product development use [Vue.js](https://vuejs.org/).
Specific vue service class are available.

# Development
## Build
`npm run build:watch`
## Test
`npm run test:watch`

# Initialize in SPFx web part
```typescript
export default class WizdomServiceTestWebPart extends BaseClientSideWebPart<...> {

  private wizdomServices: WizdomSpfxServices;

  protected async onInit(): Promise<void> {
    this.wizdomServices = new WizdomSpfxServices(this.context);
    await this.wizdomServices.InitAsync({});
  }
  ...
}
```
After initialization the following services are available.
```typescript
var context = wizdomServices.WizdomContext;
var translationService = wizdomServices.TranslationService;
var configuration = wizdomServices.WizdomConfiguration;
var cache = wizdomServices.Cache;
var apiService = wizdomServices.WizdomWebApiService;
```
## WizdomContext
```typescript
export interface IWizdomContext {
    appUrl: string;
    blobUrl: string;
    clientId: string;
}
```
## TranslationService
```typescript
export interface IWizdomTranslationService {
    /**
    * @param key    translation key
    * @returns translated string.
    */
    translate(key: string): string;
}
```
### Available query string parameters
Just as in AddIn classic it is possible to changing language by a query string.
`SPLanguage=en-us`

Show missing translations
`wizdomdevelopermode=true`
## Configuration
An object matching the content of configuration.js from AddIn classic.

### ConfigurationParser
Use ConfigurationParser to get module specific configuration.\
The ConfigurationParser will handle multiple configuration entries (@configFilters) per module.
```typescript
var configurationParser = new ConfigurationParser(wizdomServices.WizdomConfiguration);
var moduleConfiguration = configurationParser.GetModuleConfiguration("Megamenu");
```

## Cache
```typescript
export interface IWizdomCache {
    Localstorage: IWizdomLocalstorageCache;
    PageView: IWizdomPageViewCache;
    Timestamps: IWizdomTimestamps;
}
export interface IWizdomLocalstorageCache {
    ExecuteCached<T>(
      key: string, 
      func: Function, 
      expiresInMilliseconds: number,
      refreshInMilliseconds: number,
      refreshDelayInMilliseconds: number): Promise<T>;
}
export interface IWizdomPageViewCache {
    ExecuteCached<T>(
      key: string,
      func: Function,
      expiresInMilliseconds: number): T;
}
export interface IWizdomTimestamps {
    get(key?: string) : Promise<number>;
    addMappings(key: string, ...mappings: string[]) : void;
}
```
### key
Should be [Module].[Function]:[variables] ex. Megamenu.GetMenu:user(at)
wizdom.onmicrosoft.com:da-dk

When using LocalStorage [Module] will be used to look up cache bursting time stamp either by direct match, through mapping or the "global" timestampConfiguration.

So in this case:
```ts
wizdomServices.Cache.Timestamps.addMappings('Test', 'ModernCss')
wizdomServices.Cache.Localstorage.ExecuteCached('Test.Data', ...)
```
the cache will be "busted" by timestampTest, timestampModernCss and timestampConfiguration
### func
A function that returns a promise.
### expiresInMilliseconds
If the cache has not been updated within the expiration period. The func will be executed immediately.
### refreshInMilliseconds
If the cache has not been updated within the refresh period. The cached data will be returned and the func will be executed in the background.
### refreshDelayInMilliseconds
If the refresh period is expired. The func will be executed delayed by these seconds. Use this to remove load from the first few seconds of a pageload.
### return value from Timestamps.get
The return value from Timestamps.get is milliseconds since January 1st 1970 UTC

### Available query string parameters
Disable all localstorage cache. `?wizdomdevelopermode={"nocache":true}`

## WizdomWebApiService
```typescript
export interface IWizdomWebApiService {
    Get(url: string): Promise<any>;
    Delete(url: string): Promise<any>;
    Post(url: string, data: any): Promise<any>;
    Put(url: string, data: any): Promise<any>; 
}
```

# Developermode
Add the querystring
?wizdomdevelopermode=

## Change Context variables
Use developermode to change appurl.
?wizdomdevelopermode={"wizdomcontext":{"appUrl":"http://localhost:####"}}

Use developermode to show a console error on missing translations.
?wizdomdevelopermode={"errorMissingTranslations":"true"}
Whenever wizdomdevelopermode is active any missing translations will be rendered as [Translation missing: #text#]. But with this configuration a missing translation will also be written to console with "console.error". This makes it easy to spot those missing translations.

Example of full localhost usage
?wizdomdevelopermode={"nocache":"true","wizdomContext":{"appUrl":"https://localhost:44357/","clientId":"b2054421-d077-495c-9681-49c0c8246a2b","blobUrl":"https://localhost:44357/FileStorage/AzureDev/"}}

### Enable blobUrl overwrite
Place Web.config file within the /FileStorage folder. Add the following content to the file to enable cors for all origins.
```
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <remove name="Access-Control-Allow-Origin" />
        <remove name="Access-Control-Allow-Headers" />
        <remove name="Access-Control-Allow-Methods" />
        <add name="Access-Control-Allow-Origin" value="*" />
        <add name="Access-Control-Allow-Headers" value="Origin, X-Requested-With, Content-Type, Accept,Authorization" />
        <add name="Access-Control-Allow-Methods" value="GET,POST,PUT,DELETE,PATCH,OPTIONS" />
      </customHeaders>
    </httpProtocol>
    <validation validateIntegratedModeConfiguration="false" />
  </system.webServer>
</configuration>
```

## Set no cache through developermode
Use developermode to change disable cache. `?wizdomdevelopermode={"nocache":true}`

# Context data
Normally data for the wizdomcontext is stored in the tenantproperty 'wizdom.properties'. 
But it's also possible to store this data in the web property bag, ex. when hosting multiple wizdominstances in one sharepoint tenant.

To set the context data for a site, use the following powershell, with appropriate values
```
$site = Get-PnPTenantSite -Url https://myTenant.sharepoint.com/sites/somesite
Set-PnPPropertyBagValue -Key "wizdom.properties" -Value '{"appUrl":"https://url.azurewebsites.net/","blobUrl":"https://myblob.blob.core.windows.net/wizdom365public/","clientId":"60e014c8-a71c-4a56-866c-36631a87a3cf"}'
$site.Update()
$site.Context.ExecuteQuery()
```