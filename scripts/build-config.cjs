const coffeeTargets = {
  app: {
    output: "./website/js/app.js",
    inputs: [
      "./project/develop/coffee/ifl/shaders",
      "./project/develop/coffee/ifl/IFLLoader.coffee",
      "./project/develop/coffee/ifl/IFLHotspotManager.coffee",
      "./project/develop/coffee/ifl/IFLMaterialManager.coffee",
      "./project/develop/coffee/ifl/IFLModelManager.coffee",
      "./project/develop/coffee/ifl/IFLWindGenerator.coffee",
      "./project/develop/coffee/ifl/IFLAutomaticPerformanceAdjust.coffee",
      "./project/develop/coffee/ifl/IFLCameraPathInteraction.coffee",
      "./project/develop/coffee/ifl/IFLOzifyParticleSystem.coffee",
      "./project/develop/coffee/model",
      "./project/develop/coffee/collection",
      "./project/develop/coffee/router",
      "./project/develop/coffee/utils/preloader",
      "./project/develop/coffee/utils/audio",
      "./project/develop/coffee/utils/Analytics.coffee",
      "./project/develop/coffee/utils/MathUtils.coffee",
      "./project/develop/coffee/utils/QueryString.coffee",
      "./project/develop/coffee/utils/BrowserDetection.coffee",
      "./project/develop/coffee/utils/ElasticNumber.coffee",
      "./project/develop/coffee/utils/Filter.coffee",
      "./project/develop/coffee/utils/Requester.coffee",
      "./project/develop/coffee/utils/BaseAssets.coffee",
      "./project/develop/coffee/utils/Locale.coffee",
      "./project/develop/coffee/utils/Share.coffee",
      "./project/develop/coffee/utils/Templates.coffee",
      "./project/develop/coffee/view/abstract",
      "./project/develop/coffee/view/components",
      "./project/develop/coffee/view/chapters",
      "./project/develop/coffee/view/footer",
      "./project/develop/coffee/view/static",
      "./project/develop/coffee/view/Wrapper.coffee",
      "./project/develop/coffee/utils/Circle.coffee",
      "./project/develop/coffee/utils/gui",
      "./project/develop/coffee/AppView.coffee",
      "./project/develop/coffee/App.coffee"
    ]
  },
  detect: {
    output: "./website/js/appDetect.js",
    inputs: [
      "./project/develop/coffee/utils/QueryString.coffee",
      "./project/develop/coffee/model/LocaleModel.coffee",
      "./project/develop/coffee/utils/Locale.coffee",
      "./project/develop/coffee/utils/BrowserDetection.coffee",
      "./project/develop/coffee/AppDetect.coffee"
    ]
  }
};

module.exports = {
  coffeeTargets
};
