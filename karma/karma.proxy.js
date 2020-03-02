const { resolve } = require('path');
const Koa = require('koa');
const mount = require('koa-mount');
const staticFiles = require('koa-static');
const getStream = require('get-stream');
var fs = require('fs');

console.log("KARMA PROXY");

module.exports = (karma) => {
    return new Koa()
        .use(mount('/dist',
            new Koa()
                .use(distMiddleware)
                .use(staticFiles(resolve(__dirname + "..\\..\\dist")))))
        .use(mount('/node_modules',
            new Koa()
                .use(staticFiles(resolve(__dirname + "\\..\\node_modules")))))
        .use(mount('/config',
            new Koa()
                .use(configMiddleware)))
        .use(mount('/sp',
            new Koa()
                .use(appRedirectMiddleware)))
        .use(mount('/app',
            new Koa()
                .use(corsProxyMiddleware)))
        .use(karma);
};

var contentAppRedirect = null;
var contentCorsProxy = null;

const configMiddleware = async (ctx, next)=>{
    if(ctx.header["appredirect"])
        contentAppRedirect = fs.readFileSync(resolve(__dirname + "\\mocks\\" + ctx.header["appredirect"]), 'utf8').toString();
    if(ctx.header["corsproxy"])
        contentCorsProxy = fs.readFileSync(resolve(__dirname + "\\mocks\\" + ctx.header["corsproxy"]), 'utf8').toString();
}

const corsProxyMiddleware = async (ctx, next) => {
    ctx.body = contentCorsProxy; //fs.readFileSync(resolve(__dirname + "\\mocks\\corsproxy.html"), 'utf8').toString();
    // console.log("cors proxy");
}

const appRedirectMiddleware = async (ctx, next) => {
    ctx.body = contentAppRedirect; // fs.readFileSync(resolve(__dirname + "\\mocks\\appredirect.html"), 'utf8').toString();
    // console.log("app redirect");
}

const distMiddleware = async (ctx, next) => {
    await next()
    var content = await getAsString(ctx.body);
    ctx.body = content.substring(62);
    // console.log("Requesting dist", ctx.request.url);
};

const getAsString = async (value) => {
    if (Buffer.isBuffer(value)) {
        return value.toString()
    } else if (isStream(value)) {
        return await getStream(value)
    } else if (typeof value === 'string') {
        return value
    } else {
        return ''
    }
};

const isStream = (value) => value !== null && typeof value === 'object' && typeof value.pipe === 'function';