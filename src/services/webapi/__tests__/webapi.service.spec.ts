import { WizdomWebApiService } from "../webapi.service";
import { IWizdomWebApiServiceState, IWizdomWebApiService } from "../webapi.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService, IWizdomCorsProxySharedState } from "../../corsproxy/corsproxy.interfaces"

describe("WizdomWebApiService", () => {
    // Mock IFrame
    var postMessageMock;
    var corsProxy;
    var state;    
    beforeEach(() => {
        postMessageMock = jest.fn();   
        corsProxy = {
            Message: postMessageMock,
            AddHandler: () => {},
            corsProxyState: {} as IWizdomCorsProxySharedState,
            HandleMessage: () => {}
        } as IWizdomCorsProxyService

        state = {
            deferredQueue: [],
            requestQueue: {},
            requestIndex: 0,
            corsProxyReady: false
        } as IWizdomWebApiServiceState        
    });

    function setupWizdomWebApiService(): IWizdomWebApiService {
        return new WizdomWebApiService("http://sharepointHostUrl.com", state, corsProxy);
    }

    it("should handle path releative api url", () => {  
        state.corsProxyReady = true; // testing a request when cors proxy is ready
        var webapiService = setupWizdomWebApiService();

        webapiService.Get("/api/test");

        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });

    it("should handle host releative api url", () => {  
        state.corsProxyReady = true; // testing a request when cors proxy is ready
        var webapiService = setupWizdomWebApiService();

        webapiService.Get("api/test");

        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });
});