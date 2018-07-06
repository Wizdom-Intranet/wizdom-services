import { WizdomWebApiService } from "../webapi.service";
import { IWizdomCorsProxyIframe, IWizdomWebApiServiceState, IWizdomWebApiService } from "../webapi.interfaces";

describe("WizdomWebApiService", () => {
    // Mock IFrame
    var postMessageMock;
    var getIFrameFunction;
    var state;    
    beforeEach(() => {
        postMessageMock = jest.fn();   
        getIFrameFunction = () => {
            return {
                postMessage: postMessageMock
            } as IWizdomCorsProxyIframe
        };

        state = {
            deferredQueue: [],
            requestQueue: {},
            requestIndex: 0,
            corsProxyReady: false
        } as IWizdomWebApiServiceState        
    });

    function setupWizdomWebApiService(): IWizdomWebApiService {
        return new WizdomWebApiService("http://sharepointHostUrl.com", state, getIFrameFunction);
    }

    it("should handle path releative api url", () => {  
        state.corsProxyReady = true; // testing a request when cors proxy is ready
        var webapiService = setupWizdomWebApiService();

        webapiService.Get("/api/test");

        expect(postMessageMock.mock.calls[0][0]).toContain("\"url\":\"/api/test");
    });

    it("should handle host releative api url", () => {  
        state.corsProxyReady = true; // testing a request when cors proxy is ready
        var webapiService = setupWizdomWebApiService();

        webapiService.Get("api/test");

        expect(postMessageMock.mock.calls[0][0]).toContain("\"url\":\"/api/test");
    });
});