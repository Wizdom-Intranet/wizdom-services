export class ConfigurationParser {
    public Configuration: any;
    
    constructor(configuration: any) {
        this.Configuration = configuration;
    }
    public GetModuleConfiguration(module) : any {
        var result;
        var moduleConfigurationObjectOrArray = this.Configuration[module];
        if (moduleConfigurationObjectOrArray.length > 1) {
            result = moduleConfigurationObjectOrArray;
            var longestUrlLength = -1;
            for (let index = 0; index < moduleConfigurationObjectOrArray.length; index++) {
                const configuration = moduleConfigurationObjectOrArray[index];
                                        
                var configFilter = configuration["@configFilter"] || "";
                var regex = new RegExp(configFilter, "i"); // i: case insensitive                
                if (configFilter.length > longestUrlLength && regex.test(window.location.href)) {
                    result = configuration;
                    longestUrlLength = configFilter.length;
                }            
            }            
        }
        else if (moduleConfigurationObjectOrArray.length == 1) {
            result = moduleConfigurationObjectOrArray[0];
        }
        else {
            result = moduleConfigurationObjectOrArray;
        }       
        return result;
    }
}