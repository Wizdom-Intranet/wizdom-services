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

Example of full localhost usage
?wizdomdevelopermode={"nocache":"true","wizdomContext":{"appUrl":"https://localhost:44357/","clientId":"b2054421-d077-495c-9681-49c0c8246a2b","blobUrl":"https://localhost:44357/FileStorage/AzureDev/"}}

## Set no cache through developermode
Use developermode to change appurl.
?wizdomdevelopermode={"nocache":true}