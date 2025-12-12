const { Soup } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Sources = Me.imports.js.sources;

var IpFetcher = class {
  constructor() {
    this.session = new Soup.SessionAsync();
    Soup.Session.prototype.add_feature.call(this.session, new Soup.ProxyResolverDefault());
    this.currentProviderIndex = 0;
  }

  async fetchPublicIP() {
    const provider = Sources.API_PROVIDERS[this.currentProviderIndex];

    try {
      const data = await Sources.fetchFromAPI(this.session, provider.url);
      const result = provider.parseResponse.constructor.name === "AsyncFunction" ? await provider.parseResponse(data, this.session) : provider.parseResponse(data);

      this.currentProviderIndex = 0;
      return result;
    } catch (err) {
      log(`[IP Indicator] ${provider.name} failed: ${err.message}`);

      this.currentProviderIndex = (this.currentProviderIndex + 1) % Sources.API_PROVIDERS.length;

      if (this.currentProviderIndex === 0) {
        throw new Error("All providers failed");
      }

      return this.fetchPublicIP();
    }
  }

  fetchLocalIP() {
    return Sources.getLocalIP();
  }

  destroy() {
    this.session = null;
  }
};
