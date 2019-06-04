var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, PropertyPaneTextField } from '@microsoft/sp-webpart-base';
import styles from './WizdomServiceTestWebPart.module.scss';
import * as strings from 'WizdomServiceTestWebPartStrings';
import { WizdomSpfxServices } from "@wizdom-intranet/services";
var WizdomServiceTestWebPart = /** @class */ (function (_super) {
    __extends(WizdomServiceTestWebPart, _super);
    function WizdomServiceTestWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WizdomServiceTestWebPart.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.wizdomServices = new WizdomSpfxServices(this.context);
                        return [4 /*yield*/, this.wizdomServices.InitAsync({})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WizdomServiceTestWebPart.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wizdomConfiguration, wizdomContext, wizdomTranslationService, me, createdByText, notTranslatedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.renderedOnce) return [3 /*break*/, 2];
                        wizdomConfiguration = this.wizdomServices.WizdomConfiguration;
                        wizdomContext = this.wizdomServices.WizdomContext;
                        wizdomTranslationService = this.wizdomServices.TranslationService;
                        this.wizdomServices.Cache.Localstorage.ExecuteCached("Test.Date", function () {
                            console.log("Getting new Cached Date");
                            return Promise.resolve(new Date());
                        }, 5 * 60 * 1000, 2 * 60 * 1000, 10 * 1000).then(function (cachedDate) {
                            console.log("Cached Date:", cachedDate);
                        });
                        this.wizdomServices.Cache.Timestamps.Get("timestampConfiguration").then(function (timestamp) {
                            console.log("timestampConfiguration", new Date(timestamp));
                        });
                        return [4 /*yield*/, this.wizdomServices.WizdomWebApiService.Get("api/wizdom/365/principals/me")];
                    case 1:
                        me = _a.sent();
                        createdByText = wizdomTranslationService.translate("Created by") + " Wizdom";
                        notTranslatedText = wizdomTranslationService.translate("Dog Cat Sheep");
                        this.domElement.innerHTML = "\n        <div class=\"" + styles.wizdomServiceTest + "\" style=\"height:500px; overflow:hidden;\">\n            <div class=\"" + styles.container + "\">\n            <div class=\"" + styles.row + "\">\n                <div class=\"" + styles.column + "\">\n                <span class=\"" + styles.title + "\">Wizdom service no framework sample!</span>\n                <p class=\"" + styles.description + "\">\n                    <b>Wizdom Translation</b><br/>\n                    Translated: " + createdByText + "\n                    <br/>\n                    Not translated: " + notTranslatedText + "\n                </p>\n                <p class=\"" + styles.description + "\">\n                    <b>Wizdom Context</b><br/>\n                    " + JSON.stringify(wizdomContext) + "\n                </p>\n                <p class=\"" + styles.description + "\">\n                    <b>Wizdom ApiService Me Request</b><br/>\n                    " + JSON.stringify(me) + "\n                </p>\n                <p class=\"" + styles.description + "\">\n                    <b>Wizdom Configuration</b><br/>                    \n                    " + JSON.stringify(wizdomConfiguration) + "                    \n                </p>\n                </div>\n            </div>\n            </div>\n        </div>";
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(WizdomServiceTestWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse('1.0');
        },
        enumerable: true,
        configurable: true
    });
    WizdomServiceTestWebPart.prototype.getPropertyPaneConfiguration = function () {
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
    };
    return WizdomServiceTestWebPart;
}(BaseClientSideWebPart));
export default WizdomServiceTestWebPart;
//# sourceMappingURL=WizdomServiceTestWebPart.js.map