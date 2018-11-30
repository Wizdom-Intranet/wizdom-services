import { IWizdomTimestamps, IWizdomTimestampsResolver } from "./cache.interfaces";
import { IHttpClient } from "../../shared/httpclient.wrappers/http.interfaces";
import { WizdomCache } from "./cache";

export class WizdomTimestamps implements IWizdomTimestamps, IWizdomTimestampsResolver {
  constructor(private parent: WizdomCache, private forceNoCache: boolean, private spHttpClient: IHttpClient, private absoluteUrl: string) {}

  private GetTimestampsPromise(timestamps?: { [key: string]: number }): Promise<{ [key: string]: number }> {
    let globalCacheVariable = this.parent.getGlobalVariable();
    let key = "TimestampsPromise";
    if (!globalCacheVariable[key]) {
      let resolveFunc;
      globalCacheVariable[key] = new Promise<{ [key: string]: number }>((resolve, reject) => {
        resolveFunc = resolve;
        if (this.forceNoCache) {
          resolve({timestampconfiguration: new Date().getTime()});
          return;
        }
        if (!timestamps) {
          this.requestTenantProperties(resolve);
          // Reject after 2 seconds
          setTimeout(_ => {
            reject();
          }, 2000);  
        }
      });
      globalCacheVariable[key].resolveFunc = resolveFunc;
    }
    if (timestamps) {
      for (const key in timestamps) {
        if (timestamps.hasOwnProperty(key)) {
          timestamps[key.toLowerCase()] = timestamps[key];
        }
      }
      globalCacheVariable[key].resolveFunc(timestamps);
    }
    return globalCacheVariable[key];
  }
  private requestTenantProperties(resolve: (value?: { [key: string]: number; }) => void) {
    let getTenantPropertiesUrl = `${this.absoluteUrl.replace(/\/$/, "")}/_api/web/GetStorageEntity('wizdom.timestamps')`; // prettier-ignore
    this.spHttpClient.get(getTenantPropertiesUrl).then(response => {
      response.json().then(outerJson => {
        if (outerJson.Value) {
          let innerJson = JSON.parse(outerJson.Value);
          for (const key in innerJson) {
            if (innerJson.hasOwnProperty(key)) {
              innerJson[key.toLowerCase()] = innerJson[key];
            }
          }
          resolve(innerJson);
        }
      });
    });
  }
  private getGlobalMappings() {
    let globalCacheVariable = this.parent.getGlobalVariable();
    let key = "TimestampsMappings";
    if (!globalCacheVariable[key]) {
      globalCacheVariable[key] = {};
    }
    return globalCacheVariable[key];
  }
  private static normaliseKey(key?: string) {
    if (key) {
      key = key.toLocaleLowerCase();
      if (key.indexOf("timestamp") != 0) {
        key = "timestamp" + key;
      }
    }
    return key;
  }
  /**
   * Get timestamp for last modification
   * @param key Key to get timestamp for
   * @returns timestamp as UTC milliseconds since January 1st 1970
   */
  public Get(key?: string): Promise<number> {
    key = WizdomTimestamps.normaliseKey(key);
    return this.GetTimestampsPromise()
      .then(json => {
        let result = 0;
        let keys = [key, "timestampconfiguration", ...this.getGlobalMappings()[key]];
        keys.forEach(k => {
          if (k && json[k]) result = Math.max(result, json[k]);
        });
        return result;
      })
      .catch(_ => {
        console.log("Call for wizdom.timestamps timed out");
        return 0;
      });
  }
  /**
   * Add mappings to look for when getting key
   * @param key Key for which to add mappings
   * @param maps Alternative timestamp keys which should also match lookup for Key
   */
  public AddMappings(key: string, ...maps: string[]) {
    key = WizdomTimestamps.normaliseKey(key);
    let globalMappings = this.getGlobalMappings();
    globalMappings[key.toLowerCase()] = maps.map(map => WizdomTimestamps.normaliseKey(map));
  }
  /**
   * Resolve timestamps in another way than by getting Tenant properties
   * @param timestamps The timestamps to resolve with
   */
  public Resolve(timestamps: { [key: string]: number }): void {
    this.GetTimestampsPromise(timestamps);
  }
}
