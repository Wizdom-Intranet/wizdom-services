import { WizdomWebApiService } from "../webapi.service";
import { IWizdomWebApiServiceState, IWizdomWebApiService } from "../webapi.interfaces";
import { IWizdomCorsProxyIframe, IWizdomCorsProxyService, IWizdomCorsProxySharedState } from "../../corsproxy/corsproxy.interfaces"

describe("WizdomWebApiService", () => {
    // Mock console
    (window as any).console = {};    
    const consoleWarnMock = jest.fn();    
    window.console.warn = consoleWarnMock;
    const consoleInfoMock = jest.fn();
    window.console.info = consoleInfoMock;
    const consoleLogMock = jest.fn();
    window.console.log = consoleLogMock;

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
        return new WizdomWebApiService("http://sharepointHostUrl.com", state, {GetOrCreate(){return corsProxy}});
    }

    it("should handle path releative api url", () => {  
        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        webapiService.Get("/api/test");
        expect(state.requestQueue[1]).toHaveProperty("url", "/api/test"); // the queue, should contain the original url, incase we need to retry on tokenexpired
        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
        expect(consoleInfoMock.mock.calls[0][0]).toBe("Sending request to: /api/test");
    });

    it("should handle host releative api url", () => { 
        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        webapiService.Get("api/test");
        expect(state.requestQueue[1]).toHaveProperty("url", "api/test"); // the queue, should contain the original url, incase we need to retry on tokenexpired
        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "/api/test?SPHostUrl=http://sharepointHostUrl.com");
        expect(consoleInfoMock.mock.calls[0][0]).toBe("Sending request to: /api/test");
    });

    it("should ratelimit request, if to more than 300 GET requests is made in 5 min", ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready

        expect.assertions(1);

        for(var i=0;i<300;i++)
            expect(webapiService.Get("api/test")).rejects.toBeNull(); // this will "force" the promise to actually be "run"

        // expect error for request #301
        expect(webapiService.Get("api/test")).rejects.toEqual("Corsproxy request ratelimit exceeded");
    });

    it("should not ratelimit, if 301 GET requests are made over a period of 6 min", async ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        jest.useFakeTimers();

        expect.assertions(0);
        for(var i=0;i<301;i++)
        {
            expect(webapiService.Get("api/test")).rejects.toBeNull(); // this will "force" the promise to actually be "run"
            jest.advanceTimersByTime(6*60/301*1000);
        }
    });

    it("should not ratelimit request, if making 'to many' post requests", ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready

        for(var i=0;i<301;i++)
            expect(webapiService.Post("api/test", {})).rejects.toBeNull(); // this will "force" the promise to actually be "run"
    });
});