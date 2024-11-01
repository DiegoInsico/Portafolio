// config/shortcutPlugin.js

const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withShortcutPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Configura el acceso directo en el AndroidManifest.xml
    if (!mainApplication["meta-data"]) {
      mainApplication["meta-data"] = [];
    }

    // Agrega el acceso directo en el manifiesto
    mainApplication["meta-data"].push({
      $: {
        "android:name": "android.shortcuts",
        "android:resource": "@xml/shortcuts",
      },
    });

    return config;
  });
};
