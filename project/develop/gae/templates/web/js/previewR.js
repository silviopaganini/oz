window.___gcfg=
{
    lang      : (navigator.language || navigator.userLanguage),
    parsetags : "explicit"
};

window._gaq = [['_setAccount','UA-37524215-3'],['_trackPageview']];

var paths = {
    "core"           : "/js/vendor/vendor.core.min",
    'preloadJS'      : "/js/vendor/preloadjs-0.2.0.min",
    "sonic"          : "/js/vendor/sonic",
    "twitter"        : "//platform.twitter.com/widgets",
    "analytics"      : "//www.google-analytics.com/ga",
    "gplus"          : "//apis.google.com/js/plusone"
};

requirejs.config({

    paths: paths,

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery']
        }
    }
});

var libs = [];
for(var n in paths) libs.push(n);

require(libs, function ()
{
    require(['/js/preview.min.js']);
});
