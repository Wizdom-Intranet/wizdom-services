import { WizdomWebApiService } from "../webapi.service";
import { IWizdomWebApiServiceState, IWizdomWebApiService, WebApiErrorType } from "../webapi.interfaces";
import { IWizdomCorsProxyService, IWizdomCorsProxySharedState, IWizdomCorsProxyServiceFactory } from "../../corsproxy/corsproxy.interfaces"

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
            requestRateLimitCounter : 0,
            corsProxyFailed: false,
        } as IWizdomWebApiServiceState        
    });

    function setupWizdomWebApiService(): IWizdomWebApiService {
        var fakeCorsProxyFactory = { GetOrCreate(){ return corsProxy; } } as IWizdomCorsProxyServiceFactory;
        return new WizdomWebApiService("http://sharepointHostUrl.com", state, fakeCorsProxyFactory);
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
    
    it("should handle external api request url", () => { 
        var webapiService = setupWizdomWebApiService();
        state.corsProxyReady = true; // testing a request when cors proxy is ready

        webapiService.Get("http://localhost:8080/api/test");
        expect(state.requestQueue[1]).toHaveProperty("url", "http://localhost:8080/api/test"); // the queue, should contain the original url, incase we need to retry on tokenexpired
        expect(postMessageMock.mock.calls[0][0]).toHaveProperty("url", "http://localhost:8080/api/test?SPHostUrl=http://sharepointHostUrl.com");
        expect(consoleInfoMock.mock.calls[2][0]).toBe("Sending request to: http://localhost:8080/api/test");
    });

    it("should ratelimit request, if to more than 300 GET requests is made in 5 min", ()=>{
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready

        expect.assertions(1);

        for(var i=0;i<300;i++)
            expect(webapiService.Get("api/test")).rejects.toBeNull(); // this will "force" the promise to actually be "run"

        // expect error for request #301
        expect(webapiService.Get("api/test")).rejects.toEqual({errorType: WebApiErrorType.RateLimitExeeded, message: "Corsproxy request ratelimit exceeded"});
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

    it("Should fail requests if the corsproxy has an error", () => {
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready
         state.corsProxyFailed = true;

        // expect error for request
        expect(webapiService.Get("api/test")).rejects.toEqual({errorType: WebApiErrorType.CorsProxyFailed , message: "Corsproxy failed initilisation"});
    })

    it("Should fail queued requests if the corsproxy state chages to error", () => {
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = false;
         state.corsProxyFailed = false;

        // expect error for request when corsproxystate gets updated to failed
        expect(webapiService.Get("api/test")).rejects.toEqual({errorType: WebApiErrorType.CorsProxyFailed , message: "Corsproxy failed initilisation"});

        corsProxy.HandleMessage("WizdomCorsProxyFailed");
    })

    it("Should start failing requests if the corsproxy state chages to error", () => {
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true;
         state.corsProxyFailed = false;

        // Expect success before corsproxy fails
        expect(webapiService.Get("api/test")).rejects.toBeNull();

        corsProxy.HandleMessage("WizdomCorsProxyFailed");

        // expect error for request when corsproxystate has been updated to failed
        expect(webapiService.Get("api/test")).rejects.toEqual({errorType: WebApiErrorType.CorsProxyFailed , message: "Corsproxy failed initilisation"});
    })

    it("Should complete queued requests when corsproxy succeedes initilization", () => {
        console.info = console.error = jest.fn(); // hide console spam from the SUT

        var webapiService = setupWizdomWebApiService();
         state.corsProxyReady = true; // testing request when cors proxy is ready
         state.corsProxyFailed = true; // testing request when cors proxy failed init

        // expect error for request when state is dublicious claiming both success and faliure for the corsproxy state
        expect(webapiService.Get("api/test")).rejects.toEqual({errorType: WebApiErrorType.CorsProxyFailed , message: "Corsproxy failed initilisation"});
    })
});