export class TranslationsTestData {
    static CreateTranslationResponse(language: string, translations: { [key: string]: string }) {
        var result = "angular.module('Wizdom365.Translations',[]).value('translations',{\"" + language +"\":{\"";        
        var keys = Object.keys(translations);
        keys.forEach(function(key) {            
            result += key + "\":\"" + translations[key];            
        });
        result += "\"}}).filter('translate',['translations',function(translations){var language=Wizdom&&Wizdom.getCurrentLanguage?Wizdom.getCurrentLanguage():WizdomGetCurrentLanguage();return function(translationId,interpolateParams,interpolation){var arguments=angular.isArray(interpolateParams)?interpolateParams:angular.isObject(interpolateParams)?interpolateParams:angular.isDefined(interpolateParams)?[interpolateParams]:[];var rtnVal=(translations[language]==null||!translations[language][translationId])?translationId:translations[language][translationId];angular.forEach(arguments,function(value,index){rtnVal=rtnVal.replace('{ '+index+'}',value||'');});return rtnVal;}}])";
        return result;        
    }
}