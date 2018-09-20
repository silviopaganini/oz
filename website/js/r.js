var paths = {
    "three"                 : "/js/vendor/three/three.merged",
    "jquery.pause"          : "/js/vendor/jquery.pause.min",
    "transit"               : "/js/vendor/jquery.transit.min",
    "tween"                 : "/js/vendor/Tween",
    'preloadJS'             : "/js/vendor/preloadjs-0.2.0.min",
    "dat.gui"               : "/js/vendor/dat.gui.min",
    "stats"                 : "/js/vendor/Stats",
    "plugins"               : "/js/plugins",
    "sonic"                 : "/js/vendor/sonic",
    // "analytics"             : "http://www.google-analytics.com/ga",
    "easeljs"               : "/js/vendor/easeljs-0.5.0.min",
    "tweenmax"              : "/js/vendor/gsap/TweenMax.min",
    "gsap"                  : "/js/vendor/gsap/jquery.gsap.min",
    "seedrandom"            : "/js/vendor/seedrandom-min",
    "ccapture"              : "/js/vendor/CCapture",
    "whammy"                : "/js/vendor/Whammy"
};

// var threeModules = [
    // "vendor/three/src/extras/LensFlarePlugin",
    // "vendor/three/src/extras/AudioListenerObject",
    // "vendor/three/src/extras/AudioObject",
    // "vendor/three/src/extras/ShaderExtras",
    // "vendor/three/src/extras/CustomImageLoader",
    // "vendor/three/src/extras/CustomImageUtils",
    // "vendor/three/src/extras/postprocessing/EffectComposer",
    // "vendor/three/src/extras/postprocessing/RenderPass",
    // "vendor/three/src/extras/postprocessing/BloomPass",
    // "vendor/three/src/extras/postprocessing/ShaderPass",
    // "vendor/three/src/extras/postprocessing/MaskPass",
    // "vendor/three/src/extras/postprocessing/SavePass",
    // "vendor/three/src/extras/postprocessing/FilmPass",
    // "vendor/three/src/extras/postprocessing/BokehShader",
    // "vendor/three/src/extras/postprocessing/ShaderGodRays",
    // "vendor/three/src/extras/ShaderUtils",
    // "vendor/three/src/renderers/WebGLRenderer",
    // "vendor/three/src/extras/Hud"
// ];

var libs = [];
for(var n in paths) libs.push(n);

requirejs.config({
    baseUrl: '/js',
    paths: paths
});

require(libs, function()
{
    require(['/js/app.js']);
});
