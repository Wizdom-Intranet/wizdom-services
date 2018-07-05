## spfxwebpart
This is a out of the box no framework spfx webpart just to give an example of how to use Wizdom Services

## Run the sample
Clone the repo
run npm install

The sample will only work in workbench from SharePoint:
/_layouts/15/workbench.aspx
It requires tenant properties: 
```json
{
    "appUrl":"",
    "blobUrl":"",
    "clientId":""
}
```

### Install @Wizdom/services
If changes are made to @wizdom/service a force installation can be done with following command:
npm install @wizdom/services --force

Recommended for development:
Use npm link
