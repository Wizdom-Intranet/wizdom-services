export interface ILocationWrapper {
    GetQueryString(queryString: string): string;
}

export class LocationWrapper implements ILocationWrapper {
    
    public GetQueryString(queryString: string): string {
        return this.getQueryStringParameterByName(queryString, window.location.href);
    }

    private getQueryStringParameterByName(name, url) : string {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", 'i'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}