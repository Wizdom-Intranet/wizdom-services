# wizdom-services
A list of core service to ease Wizdom development

## Vue.js
Wizdom product development use [Vue.js](https://vuejs.org/).
Specific vue service class are available.

# Development
npm run build:watch

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
Use developermode to change appurl.
?wizdomdevelopermode={"nocache":true}
