import { WizdomWebApiService } from "../webapi.service";
import { IWizdomWebApiServiceState, IWizdomWebApiService } from "../webapi.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService, IWizdomCorsProxySharedState } from "../../corsproxy/corsproxy.interfaces"

describe("WizdomWebApiService", () => {
    // Mock IFrame
    var postMessageMock;
    var corsProxy : IWizdomCorsProxyService;
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
            corsProxyReady: null,
            requestRateLimitCounter : 0
        } as IWizdomWebApiServiceState        
    });

    function setupWizdomWebApiService(): IWizdomWebApiService {
        return new WizdomWebApiService("http://sharepointHostUrl.com", state, {Create(){return corsProxy}});
    }

    it("should handle path releative api url", () => {  
        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        webapiService.Get("/api/test");
        expect(state.requestQueue[1]).toHaveProperty("url", "/api/test"); // the queue, should contain the original url, incase we need to retry on tokenexpired
        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });

    it("should handle host releative api url", () => { 
        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        webapiService.Get("api/test");
        expect(state.requestQueue[1]).toHaveProperty("url", "api/test"); // the queue, should contain the original url, incase we need to retry on tokenexpired
        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
    });

    it("should ratelimit request, if to more than 60 requests is made in 1 min", ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready

        expect.assertions(1);

        for(var i=0;i<60;i++)
            expect(webapiService.Get("api/test")).rejects.toBeNull(); // this will "force" the promise to actually be "run"

        // expect error for request #61
        expect(webapiService.Get("api/test")).rejects.toEqual("Corsproxy request ratelimit exceeded");
    });

    it("should not ratelimit, if more than 60 requests are made over a period of 2 min", async ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        jest.useFakeTimers();

        expect.assertions(0);
        for(var i=0;i<48;i++)
        {
            expect(webapiService.Get("api/test")).rejects.toBeNull(); // this will "force" the promise to actually be "run"
            jest.advanceTimersByTime(1250); // 60000/1250 = 48 request / min
        }
    });
});