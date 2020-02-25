const Koa = require('koa');
const mount = require('koa-mount');
const { join, resolve } = require('path');
const { start } = require('koa-karma-proxy');
const { nodeResolve } = require('koa-node-resolve');
const fs = require('fs');


console.log('Karma Proxy wrapper for Karma CLI');

const {process : processKarmaArgs} = require('karma/lib/cli');
const karmaConfig = processKarmaArgs();

const karmaProxyConfigFile = resolve('./karma.proxy.js');
var upstreamProxyServerFactory = require(karmaProxyConfigFile);
const proxyHostnameOption = null
const proxyAddressOption = null;
const proxyPortOption = null;

(async () => {
    const {
      upstreamProxyAddress,
      upstreamProxyHostname,
      upstreamProxyPort,
      karmaHostname,
      karmaPort
    } = await start(upstreamProxyServerFactory, {
      upstreamProxyAddress: proxyAddressOption,
      upstreamProxyHostname: proxyHostnameOption,
      upstreamProxyPort: proxyPortOption,
      karmaConfig
    //   karmaExitCallback: resolve,
    });
    console.log(
        `[karma-proxy] Upstream Proxy Server started at ` +
        `http://${upstreamProxyHostname}:${upstreamProxyPort}/ ` +
        `(${upstreamProxyAddress}) ` +
        `and proxy to karma at ${karmaHostname}:${karmaPort}`);
})();