// Avoid `console` errors in browsers that lack a console.
(function() {
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = window.console || {};

    while (length--) {
        // Only stub undefined methods.
        console[methods[length]] = console[methods[length]] || noop;
    }
}());

// Flash Trace (can't live without it)
(function(){(window || document).trace = function(){console.log(arguments);};})();

// Canvas 2D compatibility/perf shim for legacy libraries (EaselJS, Sonic, etc.).
// They call getContext('2d') and then use getImageData heavily.
(function() {
    if (!window.HTMLCanvasElement || !HTMLCanvasElement.prototype.getContext) return;
    var _getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, opts) {
        if (type === '2d' && (opts === undefined || opts === null)) {
            try {
                return _getContext.call(this, type, { willReadFrequently: true });
            } catch (e) {
                // Ignore and fall back to original behavior.
            }
        }
        return _getContext.call(this, type, opts);
    };
}());

// jQuery 1.x compatibility guard:
// Some legacy script endpoints now return HTML (e.g. redirects/error pages),
// which causes "Unexpected token '<'" when jQuery tries to globalEval.
(function() {
    if (!window.jQuery) return;
    window.jQuery.ajaxSetup({
        converters: {
            "text script": function(text) {
                if (/^\s*</.test(text)) {
                    if (window.console && console.warn) {
                        console.warn("Skipped evaluating script response because it looks like HTML.");
                    }
                    return text;
                }
                window.jQuery.globalEval(text);
                return text;
            }
        }
    });
}());

// SOCIAL
window.___gcfg=
{
    lang      : (navigator.language || navigator.userLanguage),
    parsetags : "explicit"
};

// requestAnimationFrame

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());