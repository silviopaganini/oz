var paths = {
    "modernizr"      : "./js/vendor/modernizr-2.6.2.min",
    "jquery"         : "./js/vendor/jquery-1.8.3.min",
    "underscore"     : "./js/vendor/underscore-1.3.3.min",
    "backbone"       : "./js/vendor/backbone-0.9.2.min",
    "json2"          : "./js/vendor/json2",
    "BrowserDetect"  : "./js/vendor/BrowserDetect"
};


var libs = [];
for(var n in paths) libs.push(n);

requirejs.config({

    baseUrl: '.',

    paths: paths,

    shim: {

        'backbone': {
            deps: ['underscore', 'jquery']
        }

    }
});

require(libs, function()
{
    require(['./js/appDetect']);
});