var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

class ZorgMode {
  constructor(extension) {
    this.extension = extension;
  }

  init() {
    Services.scriptloader.loadSubScript(
      this.extension.getURL("zorg-export.js"),
      { extension: this.extension }
    );
  }
}

// Export the API
var zorgmode = class extends ExtensionAPI {
  getAPI(context) {
    return {
      zorgmode: {
        init() {
          const zorgMode = new ZorgMode(context.extension);
          zorgMode.init();
        },
      },
    };
  }
};
