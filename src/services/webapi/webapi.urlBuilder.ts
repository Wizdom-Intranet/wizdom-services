import { IWizdomWebApiServiceConfig } from "./webapi.interfaces";

export interface IWizdomWebApiUrlBuilder {
    getApiRelativeUrl(apiUrl: string): string;
    getAppRedirectUrl() : string;
}

export class WizdomWebApiUrlBuilder implements IWizdomWebApiUrlBuilder {

    constructor(private config: IWizdomWebApiServiceConfig) {}

    public getApiRelativeUrl(url) {
        url += url.indexOf("?") > 0 ? "&" : "?";
        url += "SPHostUrl=" + this.config.spHostUrl;
        if(url[0] != "/")
            url = "/" + url;
        return url;
    }

    public getAppRedirectUrl(): string {
        var appUrl = this.config.appUrl.endsWith("/") ? this.config.appUrl : this.config.appUrl + "/";
        return this.config.spHostUrl + "/_layouts/15/appredirect.aspx?client_id=" + this.config.clientId + "&redirect_uri=" + appUrl + "Base/WizdomCorsProxy.aspx?{StandardTokens}" + "%26userLoginName=" + encodeURIComponent(this.config.userLoginName);        
    }
}