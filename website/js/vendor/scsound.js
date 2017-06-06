var SCSound = {
    isReady: false,
    webaudio: false,
    debug: false,
    doLog: false,
    self: this,
    dummyConsole: {
        log: function() {},
    },
    log: this.dummyConsole,
    initialize: function(xmlLink, mp3Link, swfLink, f, p, l) {
        SCSound.progress = p;
        SCSound.callback = f;
        SCSound.xmlPath = xmlLink;
        SCSound.soundPath = mp3Link;
        SCSound.swfLink = swfLink;
        SCSound.libLoaded = l;
        var testFlash = false;
        if (testFlash) {
            SCSound.webaudio = false;
            SCSound.initFlash();
            return false;
        }
        if (SCSound.doLog && window.console !== undefined) {
            SCSound.console = window.console;
            SCSound.console.log("scsound log mode");
        } else {
            SCSound.console = SCSound.dummyConsole;
        }
        if (typeof AudioContext !== "undefined") {
            SCSound.webaudio = true;
            SCSound.initWebAudio();
        } else {
            SCSound.webaudio = false;
            return;
            SCSound.initFlash();
        }
    },
    initFlash: function() {
        var soundDIV = document.createElement('div');
        soundDIV.setAttribute('id', 'soundcontroller');
        document.body.appendChild(soundDIV);
        if (swfobject.hasFlashPlayerVersion("9.0.0")) {
            var flashvars = {
                scDeployPath: SCSound.swfLink + "SCDeploy.swf",
                configXmlPath: SCSound.xmlPath,
                soundFolderPath: SCSound.swfLink
            };
            var params = {
                allowScriptAccess: "always"
            };
            var attributes = {
                id: "soundcontroller"
            };
            swfobject.embedSWF(SCSound.swfLink + "scjs.swf", "soundcontroller", "1", "1", "9.0.0", "", flashvars, params, attributes, function(event) {
                SCSound.flashEmbeddedHandler(event.success);
            });
        } else {
            SCSound.console.log("Flash not available");
            SCSound.callback(false);
        }
    },
    initWebAudio: function() {
        SCSound.Core.EventBus = new SCSound.Core.EventBusClass();
        SCSound.htmlAudio = true;
        SCSound.Core.EventBus.addEventListener("SCLoadProgress", function(event, percentLoaded) {
            SCSound.receive("scsound_progress", percentLoaded, "sounds_0.swf");
        }, self);
        SCSound.Core.EventBus.addEventListener("scsound_complete", function(event, percentLoaded, fakeName) {
            SCSound.receive("scsound_complete", percentLoaded, fakeName);
        }, self);
        SCSound.sc = new SCSound.Core.SoundController(SCSound.xmlPath, SCSound.soundPath, function() {
            SCSound.receive("scsound_ready", 1, "");
            if (SCSound.debug) {
                var oHead = document.getElementsByTagName("head")[0];
                var oScript = document.createElement('script');
                oScript.type = 'text/javascript';
                oScript.src = "scdebug.js";
                oScript.onload = function() {
                    scdebug.init();
                };
                oHead.appendChild(oScript);
            }
        });
    },
    flashEmbeddedHandler: function(success) {
        if (success) {
            SCSound.hasSWF = true;
        } else {
            SCSound.callback(false);
        }
    },
    send: function(eventName, val) {
        if (SCSound.webaudio) {
            SCSound.sc.trig(eventName, val);
        } else if (SCSound.hasSWF) {
            if (swfobject.hasFlashPlayerVersion("9.0.0")) {
                if (typeof val == "undefined") {
                    document.getElementById('soundcontroller').sendToActionScript(eventName);
                } else {
                    document.getElementById('soundcontroller').sendToActionScript(eventName, val);
                }
            }
        }
    },
    setListenerPosition: function(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
        if (!SCSound.webaudio) return;
        SCSound.sc.setListenerPosition(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
        if (cameraY > 20 && cameraY < 22) {
            var v = (cameraX - 70) / 40;
            if (v < 0) {
                v = 0
            };
            if (v > 1) {
                v = 1
            };
            v = Math.abs(v - 1);
            SCSound.sc.setEffectParam("carnival", "filter", "frequency", (20000 * v) + 350, 0);
            SCSound.sc.setEffectParam("organ", "organfilter", "frequency", (20000 * v) + 350, 0);
            SCSound.sc.setBusVolume("market1", v * 0.5, 0);
            SCSound.sc.setBusVolume("market2", v * 0.5, 0);
        } else if (cameraX > -100 && cameraX < 0) {
            var v2 = (cameraX + 100) / 100;
            if (v2 < 0) {
                v2 = 0
            };
            if (v2 > 1) {
                v2 = 1
            };
            SCSound.sc.setBusVolume("insidetornado", v2, 0);
        }
    },
    setPannerPosition: function(eventName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
        return;
        SCSound.sc.setPannerPosition(eventName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
    },
    receive: function(value, percentLoaded, swfName) {
        SCSound.hasSWF = true;
        if (value == "scsound_ready" || value == 'soundcontroller_loaded') {
            SCSound.isReady = true;
            SCSound.callback(true);
        }
        if (value == "scsound_progress" && swfName == 'sounds_0.swf') {
            SCSound.progress(percentLoaded);
        }
        if (value == "scsound_complete") {
            var s = swfName.split("sounds_");
            var n = s[1].split(".swf");
            var libNbr = n[0];
            if (SCSound.libLoaded) {
                SCSound.libLoaded(libNbr);
                SCSound.console.log("Sounds loaded:", libNbr);
            }
        }
    }
};
SCSound.Core = {};

function sendToJavaScript(value, percentLoaded, swfName) {
    SCSound.receive(value, percentLoaded, swfName);
}
SCSound.Core.SoundController = function(xmlPath, soundPath, initCallback) {
    this.initCallback = initCallback;
    this.xmlPath = xmlPath;
    this.init();
    this.soundPath = soundPath;
};
SCSound.Core.SoundController.prototype = {
    init: function() {

        this.context = new AudioContext();
        this.listener = this.context.listener;
        this.master = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.startVolume = 1;
        this.master.gain.value = this.startVolume;
        this.master.connect(this.context.destination);
        this.groups = {};
        this.sounds = {};
        this.arrangements = {};
        this.bufferList = {};
        this.soundObjects = {};
        this.soundNames = [];
        this.eventTriggers = {};
        this.busses = {};
        this.total0 = 4949171;
        this.total = [176922, 1679587, 91098, 330292, 1649765, 337167];
        this.totalLoaded = 0;
        this.autoload = {};
        this.loadXML();
        SCSound.Core.SoundController.bufferList = this.bufferList;
        SCSound.Core.SoundController.context = this.context;
        SCSound.Core.SoundController.master = this.master;
        SCSound.Core.SoundController.compressor = this.compressor;
        SCSound.Core.busses = this.busses;
    },
    loadXML: function() {
        var that = this;
        var xmlhttp, txt, xx, x, i;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var xml = xmlhttp.responseXML;
                that.parseXML(xml);
            }
        }
        xmlhttp.open("GET", that.xmlPath, true);
        xmlhttp.send();
    },
    parseXML: function(xml) {
        var that = this;
        var files = xml.getElementsByTagName("file");
        for (var i = 0; i < files.length; i++) {
            var name = files[i].childNodes[0].nodeValue.split(".");
            var autoload = files[i].getAttribute("autoload");
            var n = name[0].split("sounds_");
            var a = n[1];
            if (autoload == "1") {
                that.autoload[a] = true;
                that.autoSwfNr = a;
            } else {
                that.autoload[a] = false;
            }
        }
        var busnodes = xml.getElementsByTagName("bus");
        for (var j = 0; j < busnodes.length; j++) {
            var bus = {
                name: busnodes[j].getAttribute("name"),
                parent: busnodes[j].getAttribute("parent"),
                volume: busnodes[j].getAttribute("volume"),
                panX: busnodes[j].getAttribute("pan"),
                panY: busnodes[j].getAttribute("panY"),
                panZ: busnodes[j].getAttribute("panZ"),
                group: busnodes[j].getAttribute("groupName")
            };
            if (bus.panX == null) {
                bus.pan = false;
            } else {
                bus.pan = true;
                if (bus.panY == null) bus.panY = 0;
                if (bus.panZ == null) bus.panZ = 0;
            }
            var b = new SCSound.Core.Bus(bus.name, bus.volume, bus.parent, bus.panX, bus.panY, bus.panZ, bus.pan, bus.group);
            that.busses[bus.name] = b;
        }
        var groupnodes = xml.getElementsByTagName("group");
        var hasChildren = groupnodes.length > 0;
        if (hasChildren) {
            for (var k = 0; k < groupnodes.length; k++) {
                var name = groupnodes[k].getAttribute("name");
                var volume = groupnodes[k].getElementsByTagName("volume")[0].childNodes[0].nodeValue;
                var inserts = [];
                var sends = [];
                var effectnodes = groupnodes[k].getElementsByTagName("effect");
                for (var l = 0; l < effectnodes.length; l++) {
                    var fx = {};
                    var fxHasChildren = effectnodes[l].getElementsByTagName('param').length > 0;
                    if (fxHasChildren) {
                        fx.effectId = effectnodes[l].getAttribute("id");
                        fx.effectInstance = effectnodes[l].getAttribute("instance");
                        fx.effectType = effectnodes[l].getAttribute("type");
                        fx.params = {};
                        var paramnodes = effectnodes[l].getElementsByTagName('param');
                        for (var m = 0; m < paramnodes.length; m++) {
                            var key = paramnodes[m].getAttribute("key");
                            var val = paramnodes[m].getAttribute("value");
                            fx.params[key] = val;
                        }
                        if (fx.effectType == "insert") {
                            inserts.push(fx);
                        } else if (fx.effectType == "send") {
                            sends.push(fx);
                        }
                    }
                }
                var group = new SCSound.Core.Group(volume, inserts, sends);
                that.groups[name] = group;
            }
        }
        var soundnodes = xml.getElementsByTagName("soundData")[0].childNodes;
        for (var n = 0; n < soundnodes.length; n++) {
            if (soundnodes[n].nodeName == "sound") {
                var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
                var stringLength = soundnodes[n].getElementsByTagName("length")[0].childNodes[0].nodeValue;
                var l = null;
                if (soundnodes[n].getElementsByTagName("load")[0]) {
                    l = soundnodes[n].getElementsByTagName("load")[0].childNodes[0].nodeValue;
                } else {
                    l = null;
                }
                var load = that.autoSwfNr;
                if (l) {
                    load = l;
                }
                var length;
                if (stringLength.indexOf(",") > -1) {
                    var lengthArr = stringLength.split(",");
                    length = that.beatToMilliseconds(lengthArr[0], lengthArr[1]) / 1000;
                } else {
                    length = stringLength / 1000;
                }
                var audioSprite = false;
                var start = 0;
                var duration = 0;
                var source = null;
                if (soundnodes[n].getElementsByTagName("start")[0]) {
                    start = parseFloat(soundnodes[n].getElementsByTagName("start")[0].childNodes[0].nodeValue) / 1000;
                    duration = parseFloat(soundnodes[n].getElementsByTagName("duration")[0].childNodes[0].nodeValue) / 1000;
                    source = soundnodes[n].getElementsByTagName("src")[0].childNodes[0].nodeValue;
                    audioSprite = true;
                }
                that.soundNames.push(name);
                var s = new SCSound.Core.Sound(name, length, "");
                s.load = load;
                s.audioSprite = audioSprite
                if (audioSprite) {
                    s.start = start / 44.1;
                    s.source = source;
                    s.duration = (duration / 44.1) - 0.024;
                }
                that.sounds[name] = s;
            } else if (soundnodes[n].nodeName == "soundObject") {
                var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
                var mode = soundnodes[n].getElementsByTagName("mode")[0].childNodes[0].nodeValue;
                var volume = soundnodes[n].getElementsByTagName("volume")[0].childNodes[0].nodeValue;
                var pan = soundnodes[n].getElementsByTagName("pan")[0].childNodes[0].nodeValue;
                var loop = soundnodes[n].getElementsByTagName("loop")[0].childNodes[0].nodeValue;
                var groupName = "";
                if (soundnodes[n].getElementsByTagName("groupName").length > 0) {
                    groupName = soundnodes[n].getElementsByTagName("groupName")[0].childNodes[0].nodeValue;
                }
                var min;
                var max;
                if (soundnodes[n].getElementsByTagName("min").length > 0) {
                    min = soundnodes[n].getElementsByTagName("min")[0].childNodes[0].nodeValue;
                    max = soundnodes[n].getElementsByTagName("max")[0].childNodes[0].nodeValue;
                }
                var parentBus = soundnodes[n].getElementsByTagName("parentBus")[0].childNodes[0].nodeValue;
                var soSoundNames = [];
                var offsets = [];
                var hasUpbeat = false;
                var maxUpbeat = 0;
                var snodes = soundnodes[n].getElementsByTagName("sound");
                for (var o = 0; o < snodes.length; o++) {
                    var sound = snodes[o].childNodes[0].nodeValue;
                    var stringOffset = snodes[o].getAttribute("offset");
                    var offset;
                    if (stringOffset.indexOf(",") > -1) {
                        var offsetArr = stringOffset.split(",");
                        offset = that.beatToMilliseconds(offsetArr[0], offsetArr[1]) / 1000;
                    } else {
                        offset = stringOffset / 1000;
                    }
                    if (offset < 0) {
                        hasUpbeat = true;
                        if (offset < maxUpbeat) {
                            maxUpbeat = offset;
                        }
                    }
                    soSoundNames.push(sound);
                    offsets.push(offset);
                }
                var so = new SCSound.Core.SoundObject([], offsets);
                so.hasUpbeat = hasUpbeat;
                so.upbeatTime = maxUpbeat;
                so.soundNames = soSoundNames;
                so.name = name;
                so.mode = mode;
                if ( volume.toLowerCase() === 'top' ){
                  volume = 1;
                }
                so.volume = parseFloat(volume);
                so.gainNode.gain.value = so.volume;
                so.parentBus = parentBus;
                if (loop == "1") {
                    so.loop = true;
                } else {
                    so.loop = false;
                }
                if (groupName) {
                    so.group = that.groups[groupName];
                }
                if (min) {
                    so.min = min;
                    so.max = max;
                }
                that.soundObjects[name] = so;
            } else if (soundnodes[n].nodeName == "arrangement") {
                var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
                var domain = soundnodes[n].getElementsByTagName("domain")[0].childNodes[0].nodeValue;
                var sos = [];
                var sonodes = soundnodes[n].getElementsByTagName("soundObject");
                for (var p = 0; p < sonodes.length; p++) {
                    var so = sonodes[p].childNodes[0].nodeValue;
                    sos.push(so);
                }
                var arr = new SCSound.Core.Arrangement(name, domain);
                arr.soundObjectNames = sos;
                that.arrangements[name] = (arr);
            }
        }
        var actionnodes = xml.getElementsByTagName("action");
        for (var q = 0; q < actionnodes.length; q++) {
            var event = actionnodes[q].getElementsByTagName("event")[0].childNodes[0].nodeValue;
            var trigger = {
                event: event
            };
            var targets = [];
            var targetnodes = actionnodes[q].getElementsByTagName("target");
            for (var r = 0; r < targetnodes.length; r++) {
                var action = targetnodes[r].getAttribute("id");
                var target = {
                    action: action
                };
                var args = [];
                var argnodes = targetnodes[r].getElementsByTagName("arg");
                for (var s = 0; s < argnodes.length; s++) {
                    if (argnodes[s].getAttribute("id")) {
                        var key = argnodes[s].getAttribute("key");
                        var value = argnodes[s].getAttribute("value");
                        if (args[key] == undefined) {
                            args[key] = [];
                            args[key].push(value);
                        } else {
                            args[key].push(value);
                        }
                    } else {
                        var key = argnodes[s].getAttribute("key");
                        var value = argnodes[s].getAttribute("value");
                        args[key] = value;
                    }
                }
                target.args = args;
                targets.push(target);
            }
            trigger.targets = targets;
            that.eventTriggers[event] = trigger;
        }
        var al = false;
        for (var l in that.autoload) {
            if (that.autoload[l]) {
                al = true;
                that.loadSounds(0, "auto");
            }
        }
        if (!al) {
            that.initSC("auto");
        }
    },
    loadSounds: function(i, load) {
        var that = this;
        var lib;
        if (i != that.soundNames.length) {
            if (that.sounds[that.soundNames[i]].audioSprite) {
                that.loadSounds(i + 1, load);
                return;
            } else if (that.sounds[that.soundNames[i]].load == "stream") {
                var audio = new Audio();
                audio.src = this.soundPath + that.soundNames[i] + ".mp3";
                audio.preload = "none";
                that.bufferList[that.soundNames[i]] = audio;
                that.loadSounds(i + 1, load);
                return;
            } else if (load == "auto" && that.autoload[that.sounds[that.soundNames[i]].load] == false) {
                that.loadSounds(i + 1, load);
                return;
            } else if (load != "auto" && load != that.sounds[that.soundNames[i]].load) {
                that.loadSounds(i + 1, load);
                return;
            }
            lib = that.sounds[that.soundNames[i]].load;
            var url = that.soundPath + that.soundNames[i] + ".mp3";
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = (that.totalLoaded + evt.loaded) / that.total[lib];
                    if (evt.loaded / evt.total == 1) {
                        that.totalLoaded += evt.loaded;
                        SCSound.console.log(that.totalLoaded);
                    }
                    SCSound.Core.EventBus.dispatch("SCLoadProgress", this, percentComplete);
                }
            }, false);
            request.onload = function() {
                var nameArray;
                var buffer;

                that.context.decodeAudioData(request.response, function onSuccess(decodedBuffer) {

                    buffer = decodedBuffer;

                    nameArray = that.soundNames[i].split(".");
                    that.bufferList[nameArray[0]] = buffer;
                    that.loadSounds(i + 1, load);

                }, function onFailure() {
                    console.log("Decoding the audio buffer failed");
                });
            }
            request.send();
        } else {
            that.initSC(load);
            var fakeSwfName = "sounds_" + load + ".swf";
            if (load == "auto") {
                fakeSwfName = "sounds_" + that.autoSwfNr + ".swf";
            }
            that.totalLoaded = 0;
            SCSound.Core.EventBus.dispatch("scsound_complete", this, 1, fakeSwfName);
        }
    },
    initSC: function(load) {
        for (var k in this.sounds) {
            if (!this.sounds[k].audioBuffer && !this.sounds[k].audioSprite) {
                this.sounds[k].audioBuffer = this.bufferList[this.sounds[k].name];
            }
        }
        for (var i in this.soundObjects) {
            var so = this.soundObjects[this.soundObjects[i].name];
            if (so.sounds.length > 0) {
                if (so.sounds[0].audioBuffer || this.sounds[k].audioSprite) {
                    continue;
                }
            }
            so.sounds = [];
            for (var i = 0; i < so.soundNames.length; i++) {
                var s = SCSound.Core.copy(this.sounds[so.soundNames[i]], "Sound");
                s.parentSO = so;
                so.sounds.push(s);
            }
        }
        for (var j in this.arrangements) {
            var arr = this.arrangements[this.arrangements[j].name];
            if (arr.soundObjects.length > 0) {
                if (arr.soundObjects[0].sounds[0].audioBuffer ||  arr.soundObjects[0].sounds[0].audioSprite) {
                    continue;
                }
            }
            arr.soundObjects = [];
            for (var i = 0; i < arr.soundObjectNames.length; i++) {
                var so = SCSound.Core.copy(this.soundObjects[arr.soundObjectNames[i]], "SoundObject");
                arr.soundObjects.push(so);
            }
            arr.soundObjects.sort(function(a, b) {
                return a.upbeatTime - b.upbeatTime
            });
        }
        if (load != "auto") {
            return;
        }
        for (var m in this.busses) {
            if (this.busses[m].name == "_MasterBus" || this.busses[m].parent == "_MasterBus") {
                this.busses[m].gainNode.connect(SCSound.Core.SoundController.master);
            } else if (this.busses[m].parent == "_MasterBus") {
                this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].gainNode);
            } else {
                if (this.busses[m].group) {
                    if (this.busses[this.busses[m].parent].pan) {
                        this.busses[m].gainNode.connect(this.groups[this.busses[m].group].firstNode);
                        this.groups[this.busses[m].group].lastNode.connect(this.busses[this.busses[m].parent].panner);
                    } else {
                        this.busses[m].gainNode.connect(this.groups[this.busses[m].group].firstNode);
                        this.groups[this.busses[m].group].lastNode.connect(this.busses[this.busses[m].parent].gainNode);
                    }
                } else {
                    if (this.busses[this.busses[m].parent].pan) {
                        this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].panner);
                    } else {
                        this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].gainNode);
                    }
                }
            }
        }
        for (var l in this.groups) {
            if (this.groups[l].hasReverb) {
                this.groups[l].hasReverb.buffer = this.bufferList[this.groups[l].reverbFile];
            }
        }
        this.initCallback();
    },
    trig: function(event, val) {
        SCSound.console.log(event, val);
        if (!this.eventTriggers[event]) return false;
        var targets = this.eventTriggers[event].targets;
        for (var i = 0; i < targets.length; i++) {
            switch (targets[i].action) {
                case "PlayArrAction":
                    var delay = 0;
                    if (targets[i].args["delay"]) {
                        delay = targets[i].args["delay"];
                    }
                    this.playArr(targets[i].args["name"], true, false, delay);
                    break;
                case "StartSOAction":
                    var delay = 0;
                    if (targets[i].args["delay"]) {
                        delay = targets[i].args["delay"];
                    }
                    this.playSO(targets[i].args["name"], delay);
                    break;
                case "PlaySOAction":
                    var currArrs = this.getCurrentArrangements();
                    var offset = 0;
                    for (var j = 0; j < currArrs.length; j++) {
                        var arr = currArrs[j];
                        if (arr.domain == targets[i].args["domain"]) {
                            offset = arr.getNextClipPoint();
                        }
                    }
                    this.soundObjects[targets[i].args["name"]].play(SCSound.Core.SoundController.context.currentTime + offset, 0, 0);
                    break;
                case "StopSOAction":
                    this.stopSO(targets[i].args["name"], true);
                    break;
                case "FadeAndStopDomainAction":
                    this.fadeAndStopDomain(targets[i].args["name"], targets[i].args["fadeOutTime"]);
                    break;
                case "BusVolumeAction":
                    this.setBusVolume(targets[i].args["name"], targets[i].args["vol"], targets[i].args["time"]);
                    break;
                case "BusPanAction":
                    this.setBusPan(targets[i].args["name"], targets[i].args["time"], targets[i].args["pan"], targets[i].args["panY"], targets[i].args["panZ"]);
                    break;
                case "SetBusVolumeAction":
                    if (val < 0) {
                        val = Math.abs(val);
                    }
                    val *= 40;
                    if (val > 1) val = 1;
                    this.setBusVolume(targets[i].args["name"], val, 0);
                    break;
                case "SetBusPanAction":
                    if (targets[i].args["divide"]) {
                        val /= targets[i].args["divide"];
                    }
                    this.setBusPan(targets[i].args["name"], 0, val, 0, 1);
                    break;
                case "LoadSWFAction":
                    var name = targets[i].args["name"].split(".");
                    var n = name[0].split("sounds_");
                    var a = n[1];
                    this.loadSounds(0, a);
                    break;
                case "PlayRandomArrAction":
                    var names = targets[i].args["name"];
                    var rdm = Math.floor(Math.random() * names.length);
                    var currArrs = this.getCurrentArrangements();
                    for (var j = 0; j < currArrs.length; j++) {
                        var arr = currArrs[j];
                        var arrName;
                        if (arr.domain == "main") {
                            arrName = arr.name;
                        }
                    }
                    if (arrName == names[rdm]) {
                        rdm = (rdm + 1) % names.length;
                    }
                    if (arrName == "StartGame") {
                        rdm = 0;
                    }
                    this.playArr(names[rdm], false, false, 0);
                    break;
                case "ReplaceRandomArrAction":
                    var currArrs = this.getCurrentArrangements();
                    var offset = 0;
                    for (var j = 0; j < currArrs.length; j++) {
                        var arr = currArrs[j];
                        var arrName;
                        if (arr.domain == "main") {
                            arrName = arr.name;
                        }
                    }
                    var names = targets[i].args["name"];
                    var rdm = Math.floor(Math.random() * names.length);
                    this.playArr(names[rdm], false, true, 0);
                    break;
                case "StopArrAction":
                    this.stopArr(targets[i].args["name"], true);
                    break;
                case "SetPlaybackRateAction":
                    this.arrangements[targets[i].args["name"]].setPlaybackRate(val);
                    break;
                case "EffectParamAction":
                    var value;
                    if ((targets[i].args["value"]) == "val") {
                        value = val;
                    } else {
                        value = (targets[i].args["value"]);
                    }
                    if (targets[i].args["factor"]) {
                        value *= targets[i].args["factor"];
                    }
                    this.setEffectParam(targets[i].args["group"], targets[i].args["name"], targets[i].args["param"], value, targets[i].args["time"] / 1000);
                    break;
                case "UltimateUpbeatAction":
                    var so = this.soundObjects[targets[i].args["name"]];
                    var currArrs = this.getCurrentArrangements();
                    var offset = 0;
                    for (var j = 0; j < currArrs.length; j++) {
                        var arr = currArrs[j];
                        if (arr.domain == targets[i].args["domain"]) {
                            offset = arr.getNextClipPoint();
                        }
                    }
                    var k = so.offsets.length - 1;
                    var longestUpbeat = -1;
                    while (Math.abs(so.offsets[k]) < offset) {
                        longestUpbeat = k;
                        k--;
                        if (k == -1) {
                            break;
                        }
                    }
                    if (longestUpbeat > -1) {
                        so.play(SCSound.Core.SoundController.context.currentTime + offset - so.sounds[longestUpbeat].length, longestUpbeat, 0);
                    }
                    break;
                case "PauseArrAction":
                    this.pauseArr(targets[i].args["name"]);
                    break;
                case "ResumeArrAction":
                    this.resumeArr(targets[i].args["name"]);
                    break;
                default:
                    SCSound.console.log("No actions for", targets[i].action);
            }
        }
    },
    beatToMilliseconds: function(tempo, beats) {
        return ((60 / tempo) * beats) * 1000;
    },
    playSO: function(name, delay) {
        this.soundObjects[name].play(SCSound.Core.SoundController.context.currentTime, 0, delay);
    },
    stopSO: function(name, hard) {
        this.soundObjects[name].stop(hard);
    },
    setSOVolume: function(name, vol, time) {
        if (time) {
            this.soundObjects[name].gainNode.gain.setTargetValueAtTime(vol, 0, time);
        } else {
            this.soundObjects[name].gainNode.gain.cancelScheduledValues(0);
            this.soundObjects[name].gainNode.gain.value = vol;
        }
    },
    setSOPlaybackRate: function(name, rate) {
        this.soundObjects[name].setPlaybackRate(rate);
    },
    playArr: function(name, forceUpbeat, replace, delay) {
        var offset = 0;
        var currArrs = this.getCurrentArrangements();
        var id = 0;
        for (var j = 0; j < currArrs.length; j++) {
            var arr = currArrs[j];
            if (arr.name == name) {
                continue;
            }
            if (arr.domain == this.arrangements[name].domain) {
                if (replace) {
                    id = arr.getNextId();
                }
                offset = arr.stop(false);
            }
        }
        if (delay > 0) {
            offset = delay / 1000;
        }
        this.arrangements[name].play(offset, id, forceUpbeat);
    },
    replaceArr: function(name, forceUpbeat) {
        if (forceUpbeat == undefined) {
            forceupbeat = false;
        }
        var offset = 0;
        var currArrs = this.getCurrentArrangements();
        for (var j = 0; j < currArrs.length; j++) {
            var arr = currArrs[j];
            if (arr.name == name) {
                continue;
            }
            var id = 0;
            if (arr.domain == this.arrangements[name].domain) {
                id = arr.getNextId();
                offset = arr.stop(false);
            }
        }
        this.arrangements[name].play(offset, id, forceUpbeat);
    },
    stopArr: function(name, hard) {
        var nextClipPoint = this.arrangements[name].stop(hard);
        return nextClipPoint;
    },
    pauseArr: function(name) {
        this.arrangements[name].pause();
    },
    resumeArr: function(name) {
        this.arrangements[name].resume();
    },
    fadeAndStopDomain: function(domain, time) {
        var currArrs = this.getCurrentArrangements();
        var playingArr;
        for (var i = 0; i < currArrs.length; i++) {
            if (domain == currArrs[i].domain) {
                playingArr = currArrs[i];
            }
        }
        if (!playingArr) return;
        for (var j = 0; j < playingArr.soundObjects.length; j++) {
            playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(playingArr.soundObjects[j].volume, this.context.currentTime);
            playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + time / 1000);
        }
        setTimeout(function() {
            playingArr.stop(true);
            for (var k = 0; k < playingArr.soundObjects.length; k++) {
                playingArr.soundObjects[k].gainNode.gain.cancelScheduledValues(0);
                playingArr.soundObjects[k].gainNode.gain.value = playingArr.soundObjects[k].volume;
            }
        }, time)
    },
    setBusPan: function(name, time, panX, panY, panZ) {
        panY = (typeof panY === "undefined") ? this.busses[name].panY : panY;
        panZ = (typeof panZ === "undefined") ? this.busses[name].panZ : panZ;
        this.busses[name].panner.setPosition(panX, panY, panZ);
        this.busses[name].panX = panX;
        this.busses[name].panY = panY;
        this.busses[name].panZ = panZ;
    },
    setPannerPosition: function(busName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
        if (!this.busses[busName]) return;
        var bus = this.busses[busName];
        var directional = false;
        if (directional) {
            bus.panner.setOrientation(frontX, frontY, frontZ, upX, upY, upZ);
        } else {
            bus.panner.setPosition(soundX, soundY, soundZ);
        }
    },
    setListenerPosition: function(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
        this.listener.setPosition(cameraX, cameraY, cameraZ);
    },
    setBusVolume: function(name, vol, time) {
        if (time > 0) {
            this.busses[name].gainNode.gain.linearRampToValueAtTime(this.busses[name].gainNode.gain.value, this.context.currentTime);
            this.busses[name].gainNode.gain.linearRampToValueAtTime(vol, this.context.currentTime + time / 1000);
        } else {
            this.busses[name].gainNode.gain.cancelScheduledValues(0);
            this.busses[name].gainNode.gain.value = vol;
        }
    },
    setMasterVolume: function(_value) {
        this.master.gain.value = _value;
    },
    setEffectParam: function(group, _effectId, _paramName, _value, _time) {
        if (_paramName == "frequency") {
            if (_value < 20) _value = 20;
            if (_time) {
                this.groups[group].effects[_effectId].fx.frequency.linearRampToValueAtTime(this.groups[group].effects[_effectId].fx.frequency.value, this.context.currentTime);
                this.groups[group].effects[_effectId].fx.frequency.exponentialRampToValueAtTime(_value, _time + this.context.currentTime);
            } else {
                this.groups[group].effects[_effectId].fx.frequency.setValueAtTime(_value, this.context.currentTime);
            }
        }
        if (_paramName == "Q") {
            if (_time) {
                this.groups[group].effects[_effectId].fx.Q.setTargetValueAtTime(_value, 0, _time);
            } else {
                this.groups[group].effects[_effectId].fx.Q.value.cancelScheduledValues(0);
                this.groups[group].effects[_effectId].fx.Q.value = _value;
            }
        }
        if (_paramName == "delayTime") {
            if (_time) {
                this.groups[group].effects[_effectId].fx.delayTime.setTargetValueAtTime(_value, 0, _time);
            } else {
                this.groups[group].effects[_effectId].fx.delayTime.value.cancelScheduledValues(0);
                this.groups[group].effects[_effectId].fx.delayTime.value = _value;
            }
        }
        if (_paramName == "wet") {
            this.groups[group].effects[_effectId].effectNode.gain.value = _value;
        }
        if (_paramName == "sendVol") {
            if (_time) {
                this.groups[group].effects[_effectId].send.gain.setTargetValueAtTime(_value, 0, _time);
            } else {
                this.groups[group].effects[_effectId].send.gain.cancelScheduledValues(0);
                this.groups[group].effects[_effectId].send.gain.value = _value;
            }
        }
        if (_paramName == "volume") {
            if (_time) {
                this.groups[group].lastNode.gain.setTargetValueAtTime(_value, 0, _time);
            } else {
                this.groups[group].lastNode.gain.cancelScheduledValues(0);
                this.groups[group].lastNode.gain.value = _value;
            }
        }
    },
    getCurrentArrangements: function() {
        var currArrs = [];
        for (var name in this.arrangements) {
            var arr = this.arrangements[name];
            if (arr.isPlaying) {
                currArrs.push(arr);
            }
        }
        return currArrs;
    },
    stopCurrentArrangements: function(hard) {
        var currArrs = this.getCurrentArrangements();
        for (var j = 0; j < currArrs.length; j++) {
            var arr = currArrs[j];
            var nextClipPoint = arr.stop(hard);
        }
        return nextClipPoint;
    }
};
SCSound.Core.copy = function(obj, type) {
    var copy;
    if (type == "Sound") {
        copy = new SCSound.Core.Sound(obj.name, obj.length, obj.parent);
    } else if (type == "SoundObject") {
        copy = new SCSound.Core.SoundObject(obj.soundNames, obj.offsets)
    }
    for (var k in obj) {
        copy[k] = obj[k];
    }
    return copy;
};
SCSound.Core.Arrangement = function(name, domain) {
    this.name = name;
    this.domain = domain;
    this.soundObjectNames = [];
    this.isPlaying = false;
    this.soundObjects = [];
    this.hasListener = false;
    this.stoppedSos = {};
    this.stoppedSosCount = 0;
};
SCSound.Core.Arrangement.prototype = {
    play: function(offset, id, forceUpbeat) {
        if (!id) {
            id = 0
        };
        if (!forceUpbeat) {
            forceUpbeat = false
        };
        if (this.isPlaying) {
            return;
        }
        this.isPlaying = true;
        var maxUpbeat = 0;
        for (var k = 0; k < this.soundObjects.length; k++) {
            if (this.soundObjects[k].hasUpbeat && this.soundObjects[k].upbeatTime < maxUpbeat) {
                maxUpbeat = this.soundObjects[k].upbeatTime;
            }
        }
        var playingUpbeat = false;
        for (var i = 0; i < this.soundObjects.length; i++) {
            if (maxUpbeat < 0) {
                if (this.soundObjects[i].hasUpbeat && this.soundObjects[i].upbeatTime == maxUpbeat) {
                    if (offset == 0 || forceUpbeat) {
                        playingUpbeat = true;
                        this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id);
                    } else if (maxUpbeat > offset) {
                        playingUpbeat = false;
                        this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id);
                    }
                } else {
                    if (playingUpbeat) {
                        this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset + Math.abs(maxUpbeat), id);
                    } else {
                        this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id);
                    }
                }
            } else {
                this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id);
            }
            SCSound.Core.EventBus.addEventListener(this.soundObjects[i].name + "_stopped", this.soStopped, this);
        }
    },
    soStopped: function(e) {
        if (!this.stoppedSos[e.target.type]) {
            this.stoppedSos[e.target.type] = true;
            this.stoppedSosCount++;
            if (this.stoppedSosCount == this.soundObjects.length) {
                this.isPlaying = false;
                this.stoppedSos = {};
                this.stoppedSosCount = 0;
            }
        }
    },
    stop: function(hard) {
        this.getNextId();
        if (this.isPlaying == false) {
            return 0
        }
        this.isPlaying = false;
        var nextClipPoint = 0;
        for (var i = 0; i < this.soundObjects.length; i++) {
            var o = this.soundObjects[i].stop(hard);
            if (o > nextClipPoint) {
                nextClipPoint = o;
            }
        }
        this.stoppedSos = {};
        this.stoppedSosCount = 0;
        return nextClipPoint;
    },
    pause: function() {
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].pause();
        }
    },
    resume: function() {
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].resume();
        }
    },
    getNextClipPoint: function() {
        if (this.isPlaying == false) {
            return 0
        }
        var nextClipPoint = 0;
        for (var i = 0; i < this.soundObjects.length; i++) {
            var o = this.soundObjects[i].getNextClipPoint();
            if (o > nextClipPoint) {
                nextClipPoint = o;
            }
        }
        return nextClipPoint;
    },
    getNextId: function() {
        var nextId = 0;
        for (var i = 0; i < this.soundObjects.length; i++) {
            if (this.soundObjects[i].hasUpbeat) {
                continue;
            };
            var id = this.soundObjects[i].getNextId();
            if (id > nextId) {
                nextId = id;
            }
        }
        return nextId;
    },
    setPlaybackRate: function(rate) {
        this.playbackRate = rate;
        for (var i = 0; i < this.soundObjects.length; i++) {
            this.soundObjects[i].setPlaybackRate(this.playbackRate);
        }
    }
}
SCSound.Core.SoundObject = function(soundNames, offsets) {
    this.soundNames = soundNames;
    this.offsets = offsets;
    this.loop = true;
    this.mode = "pattern";
    this.volume = 1.0;
    this.upbeatTime = 0;
    this.isPlaying = false;
    this.sounds = [];
    this.gainNode = SCSound.Core.SoundController.context.createGain();
    this.gainNode.gain.value = this.volume;
    this.adder = 0;
    this.stepFlag = 0;
    this.skippedOffset = 0;
    this.startId = 0;
    this.nextSound = 0;
    this.currentSound = -1;
    this.hasStarted = false;
    this.queuedSounds = [];
    this.queuedRounds = -1;
    this.startTime = 0;
    this.soStartTime = 0;
    this.soStartId = 0;
    this.isChecking = false;
    this.playbackRate = 1.0;
};
SCSound.Core.SoundObject.prototype = {
    play: function(time, id, delay, offsetSound) {
        this.offsetSound = offsetSound;
        if (!this.offsetSound) {
            this.offsetSound = 0;
        };
        if (!id) {
            id = 0;
        };
        this.totalLength = this.offsets[this.offsets.length - 1] + this.sounds[this.sounds.length - 1].length;
        this.startId = id;
        if (!this.isPlaying) {
            this.soStartTime = time;
            this.soStartId = id;
        }
        this.isPlaying = true;
        if (this.mode == "pattern") {
            this.startTime = time;
            var _id = id % this.sounds.length;
            this.skippedOffset = this.offsets[_id];
            for (var i = _id; i < this.sounds.length; i++) {
                var s = SCSound.Core.copy(this.sounds[i], "Sound");
                this.queuedSounds.push(s);
                this.queuedSounds[this.queuedSounds.length - 1].play((this.offsets[i] - this.skippedOffset) + time, this.group, this.gainNode, false, this.offsetSound);
            }
            this.queuedRounds++;
            if (!this.isChecking) {
                this.isChecking = true;
                this.intervalId = setInterval(this.checkRound.bind(this), 100);
            }
        } else if (this.mode == "patternsingle") {
            this.startTime = time;
            var _id = id % this.sounds.length;
            this.skippedOffset = this.offsets[_id];
            var s = this.sounds[_id];
            this.queuedSounds.push(s);
            this.queuedSounds[this.queuedSounds.length - 1].play((this.offsets[_id] - this.skippedOffset) + time, this.group, this.gainNode, false, this.offsetSound);
        } else if (this.mode == "steptrig") {
            this.sounds[this.adder % this.sounds.length].play(time + (delay / 1000), this.group, this.gainNode, false, this.offsetSound);
            this.adder++;
        } else if (this.mode == "randomtrig") {
            this.adder = Math.floor(Math.random() * (this.sounds.length));
            if (this.adder < 1) this.adder = 1;
            this.stepFlag += this.adder;
            var _id = this.stepFlag % this.sounds.length;
            this.sounds[_id].play(time + (delay / 1000), this.group, this.gainNode, false, this.offsetSound);
        } else if (this.mode == "randompatternamb") {
            this.startTime = time;
            this.sounds = this.shuffleArray(this.sounds);
            var totOffset = 0;
            var lastOffset = 0;
            for (var i = 0; i < this.sounds.length; i++) {
                var s = SCSound.Core.copy(this.sounds[i], "Sound");
                this.queuedSounds.push(s);
                var randomOffset = lastOffset + this.min / 1000 + (Math.random() * this.max / 1000);
                lastOffset = randomOffset;
                this.queuedSounds[this.queuedSounds.length - 1].play(randomOffset + time, this.group, this.gainNode, false, this.offsetSound);
            }
            this.queuedRounds++;
            var soEnd = this.min / 1000 + Math.random() * this.max / 1000 + (lastOffset + this.sounds[this.sounds.length - 1].length);
            this.intervalId = setTimeout(this.play.bind(this, soEnd + time), (soEnd) * 1000);
        } else if (this.mode == "loop") {
            var s = SCSound.Core.copy(this.sounds[0], "Sound");
            this.queuedSounds.push(s);
            this.queuedSounds[0].play(time, this.group, this.gainNode, true, this.offsetSound);
        }
    },
    shuffleArray: function(o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },
    setPlaybackRate: function(rate) {
        this.playbackRate = rate;
        for (var i = 0; i < this.queuedSounds.length; i++) {
            if (this.queuedSounds[i].voice.playbackState != 3) {
                this.queuedSounds[i].setPlaybackRate(this.playbackRate);
            }
        }
    },
    checkRound: function() {
        if (this.loop) {
            if (SCSound.Core.SoundController.context.currentTime - this.soStartTime > this.totalLength * this.queuedRounds) {
                this.doLoop();
            }
        } else {
            if (SCSound.Core.SoundController.context.currentTime - this.soStartTime > this.totalLength) {
                SCSound.Core.EventBus.dispatch(this.name + "_stopped", this);
                this.isPlaying = false;
                this.resetStuff();
            }
        }
    },
    doLoop: function() {
        var playTime = this.startTime + this.totalLength - this.skippedOffset;
        this.play(playTime, 0, 0);
    },
    pause: function() {
        this.isPlaying = false;
        this.pauseTime = (SCSound.Core.SoundController.context.currentTime - this.soStartTime) + this.offsetSound;
        for (var i = 0; i < this.queuedSounds.length; i++) {
            this.queuedSounds[i].stop(true);
        }
        this.resetStuff();
    },
    resume: function() {
        this.play(SCSound.Core.SoundController.context.currentTime, 0, 0, this.pauseTime);
    },
    stop: function(hard) {
        this.isPlaying = false;
        if (hard) {
            for (var i = 0; i < this.queuedSounds.length; i++) {
                this.queuedSounds[i].stop(hard);
            }
        } else {
            var nextClipPoint = this.getNextClipPoint();
            for (var i = 0; i < this.queuedSounds.length; i++) {
                if (this.queuedSounds[i].voice.playbackState == 1) {
                    this.queuedSounds[i].stop(hard);
                }
            }
        }
        this.resetStuff();
        if (this.hasUpbeat && currentSOTime > this.sounds[0].length) {
            nextClipPoint = 0;
        } else if (this.hasUpbeat && currentSOTime < this.sounds[0].length) {
            nextClipPoint = this.sounds[0].length - currentSOTime;
        }
        return nextClipPoint;
    },
    getNextClipPoint: function() {
        if (this.hasUpbeat) return 0;
        var nextClipPoint = 0;
        var now = SCSound.Core.SoundController.context.currentTime;
        var currentSOTime = now - this.soStartTime;
        var totalLength = this.offsets[this.offsets.length - 1] + this.sounds[this.sounds.length - 1].length;
        var playedRounds = 0;
        while (currentSOTime > (totalLength * playedRounds)) {
            playedRounds++;
        }
        var relativeTime = currentSOTime - (totalLength * (playedRounds - 1));
        for (var j = 0; j < this.offsets.length; j++) {
            if (relativeTime >= (this.offsets[j] - this.skippedOffset) && relativeTime < ((this.offsets[j] - this.skippedOffset) + this.sounds[j].length)) {
                var currentSoundPosition = relativeTime - (this.offsets[j] - this.skippedOffset);
                nextClipPoint = this.sounds[j].length - currentSoundPosition;
            }
        }
        return nextClipPoint;
    },
    getPlayingSound: function() {
        var s;
        for (var i = 0; i < this.queuedSounds.length; i++) {
            if (this.queuedSounds[i].voice.playbackState == 2) {
                s = this.queuedSounds[i];
                break;
            }
        }
        return s;
    },
    resetStuff: function() {
        clearInterval(this.intervalId);
        this.isChecking = false;
        this.queuedSounds = [];
        this.queuedRounds = -1;
        this.currentSound = -1;
        this.nextSound = 0;
        this.hasStarted = false;
    },
    getNextId: function() {
        if (this.hasUpbeat) return -1;
        var now = SCSound.Core.SoundController.context.currentTime;
        var currentSOTime = now - this.soStartTime;
        var nextId = 0;
        for (var j = 0; j < this.offsets.length; j++) {
            if (currentSOTime >= (this.offsets[j] - this.skippedOffset) && currentSOTime < ((this.offsets[j] - this.skippedOffset) + this.sounds[j].length)) {
                var nextSound = j + 1 + this.soStartId;
                nextId = nextSound % this.sounds.length;
            }
        }
        return nextId;
    }
}
SCSound.Core.Sound = function(name, length, parent) {
    this.name = name;
    this.length = length;
    this.parentSO = parent;
    this.playbackRate = 1.0;
    this.isPlaying = false;
};
SCSound.Core.Sound.prototype = {
    play: function(time, group, soGain, loop, offsetSound) {
        this.isPlaying = true;
        this.playbackRate = this.parentSO.playbackRate;
        var audio = null;
        var stream = false;
        var startTime = 0;
        var duration = 0;
        this.voice = SCSound.Core.SoundController.context.createBufferSource();
        if (!this.audioBuffer && !this.audioSprite) {
            SCSound.console.log("sound", this.name, "not loaded");
            return;
        }
        if (this.audioSprite) {
            this.audioBuffer = SCSound.sc.bufferList[this.source];
            if (!this.audioBuffer) {
                SCSound.console.log("sound", this.source, "not loaded");
                return;
            }
            this.audio = this.voice;
            this.audio.buffer = this.audioBuffer;
            this.audio.playbackRate.value = this.playbackRate;
            startTime = this.start + offsetSound;
            duration = this.duration - offsetSound;
            if (loop) {
                this.audio.loop = true;
            }
        } else if (this.audioBuffer.gain) {
            this.audio = this.voice;
            this.audio.buffer = this.audioBuffer;
            this.audio.playbackRate.value = this.playbackRate;
            startTime = offsetSound;
            if (loop) {
                this.audio.loop = true;
            }
        } else if (!this.audioBuffer.gain) {
            stream = true;
            if (!this.mediaElement) {
                this.mediaElement = this.audioBuffer;
                this.audio = SCSound.Core.SoundController.context.createMediaElementSource(this.mediaElement);
            }
            if (loop) {
                this.mediaElement.loop = true;
            }
        } else {
            SCSound.console.log("Unrecognized sound type", this.name);
            return;
        }
        this.audio.connect(soGain);
        var top = soGain;
        if (SCSound.Core.busses[this.parentSO.parentBus].pan) {
            top.connect(SCSound.Core.busses[this.parentSO.parentBus].panner);
        } else {
            top.connect(SCSound.Core.busses[this.parentSO.parentBus].gainNode);
        }
        if (stream) {
            this.mediaElement.play();
        } else if (this.audioSprite) {
            if (this.voice.start) {
                this.voice.start(time, startTime, duration);
            } else {
                this.voice.noteGrainOn(time, startTime, duration);
            }
        } else if (time >= SCSound.Core.SoundController.context.currentTime - 0.2) {
            if (this.voice.start) {
                this.voice.start(time, startTime, this.audioBuffer.duration - startTime);
            } else {
                this.voice.noteGrainOn(time, startTime, this.audioBuffer.duration - startTime);
            }
        }
    },
    setPlaybackRate: function(rate) {
        if (this.voice) {
            this.playbackRate = rate;
            this.voice.playbackRate.value = this.playbackRate;
        }
    },
    stop: function(hard) {
        if (this.voice) {
            if(this.isPlaying)
            {
                this.voice.stop(0);
            }

            this.isPlaying = false;
            if (this.mediaElement) {
                this.mediaElement.pause();
            }
        }
    }
}
SCSound.Core.Group = function(vol, inserts, sends) {
    this.inserts = inserts;
    this.sends = sends;
    this.effects = {};
    this.lastNode = SCSound.Core.SoundController.context.createGain();
    this.lastNode.gain.value = vol;
    this.firstNode = SCSound.Core.SoundController.context.createGain();
    this.createFX();
}
SCSound.Core.Group.prototype = {
    createFX: function() {
        var lastInsert = this.firstNode;
        if (this.inserts.length > 0) {
            for (var i = 0; i < this.inserts.length; i++) {
                var effect = {};
                if (this.inserts[i].effectId == "Biquad") {
                    effect.fx = SCSound.Core.SoundController.context.createBiquadFilter();
                    effect.fx.type = effect.fx[this.inserts[i].params["type"]];
                    effect.fx.frequency.value = this.inserts[i].params["frequency"];
                    effect.fx.Q.value = this.inserts[i].params["Q"];
                    effect.fx.gain.value = this.inserts[i].params["gain"];
                }
                lastInsert.connect(effect.fx);
                lastInsert = effect.fx;
                this.effects[this.inserts[i].effectInstance] = effect;
            }
        }
        if (this.sends.length > 0) {
            for (var j = 0; j < this.sends.length; j++) {
                var effect = {};
                if (this.sends[j].effectId == "Convolver") {
                    effect.fx = SCSound.Core.SoundController.context.createConvolver();
                    this.reverbFile = this.sends[j].params["file"];
                    this.hasReverb = effect.fx;
                    effect.send = SCSound.Core.SoundController.context.createGain();
                    lastInsert.connect(effect.send);
                    effect.send.connect(effect.fx);
                    effect.fx.connect(SCSound.Core.SoundController.master);
                    effect.send.gain.value = 1;
                } else if (this.sends[j].effectId == "Delay") {
                    effect.fx = SCSound.Core.SoundController.context.createDelayNode();
                    effect.fx.delayTime.value = this.sends[j].params["time"];
                    effect.send = SCSound.Core.SoundController.context.createGain();
                    lastInsert.connect(effect.send);
                    effect.send.connect(effect.fx);
                    effect.fx.connect(SCSound.Core.SoundController.master);
                    effect.send.gain.value = 0.5;
                }
                this.effects[this.sends[j].effectInstance] = effect;
            }
        }
        lastInsert.connect(this.lastNode);
    }
}
SCSound.Core.Bus = function(name, volume, parent, panX, panY, panZ, pan, group) {
    this.name = name;
    this.volume = volume;
    this.panX = panX;
    this.panY = panY;
    this.panZ = panZ;
    this.pan = pan;
    this.group = group;
    this.parent = parent;
    this.gainNode = SCSound.Core.SoundController.context.createGain();
    this.gainNode.gain.value = this.volume;
    if (this.pan) {
        this.panner = SCSound.Core.SoundController.context.createPanner();
        this.panner.panningModel = "HRTF";
        this.panner.refDistance = 1;
        this.panner.setPosition(this.panX, this.panY, panZ);
        this.panner.connect(this.gainNode);
    }
};
SCSound.Core.EventBusClass = function() {
    this.listeners = {};
};
SCSound.Core.EventBusClass.prototype = {
    addEventListener: function(type, callback, scope) {
        var args = [];
        var numOfArgs = arguments.length;
        for (var i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        }
        args = args.length > 3 ? args.splice(3, args.length - 1) : [];
        if (typeof this.listeners[type] != "undefined") {
            this.listeners[type].push({
                scope: scope,
                callback: callback,
                args: args
            });
        } else {
            this.listeners[type] = [{
                scope: scope,
                callback: callback,
                args: args
            }];
        }
    },
    removeEventListener: function(type, callback, scope) {
        if (typeof this.listeners[type] != "undefined") {
            var numOfCallbacks = this.listeners[type].length;
            var newArray = [];
            for (var i = 0; i < numOfCallbacks; i++) {
                var listener = this.listeners[type][i];
                if (listener.scope == scope && listener.callback == callback) {} else {
                    newArray.push(listener);
                }
            }
            this.listeners[type] = newArray;
        }
    },
    hasEventListener: function(type, callback, scope) {
        if (typeof this.listeners[type] != "undefined") {
            var numOfCallbacks = this.listeners[type].length;
            var newArray = [];
            var hasListener;
            for (var i = 0; i < numOfCallbacks; i++) {
                var listener = this.listeners[type][i];
                if (listener.scope == scope && listener.callback == callback) {
                    hasListener = true;
                } else {
                    hasListener = false;
                }
            }
            return hasListener;
        }
    },
    dispatch: function(type, target) {
        var numOfListeners = 0;
        var event = {
            type: type,
            target: target
        };
        var args = [];
        var numOfArgs = arguments.length;
        for (var i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        };
        args = args.length > 2 ? args.splice(2, args.length - 1) : [];
        args = [event].concat(args);
        if (typeof this.listeners[type] != "undefined") {
            var numOfCallbacks = this.listeners[type].length;
            for (var i = 0; i < numOfCallbacks; i++) {
                var listener = this.listeners[type][i];
                if (listener && listener.callback) {
                    listener.args = args.concat(listener.args);
                    listener.callback.apply(listener.scope, listener.args);
                    numOfListeners += 1;
                }
            }
        }
    },
    getEvents: function() {
        var str = "";
        for (var type in this.listeners) {
            var numOfCallbacks = this.listeners[type].length;
            for (var i = 0; i < numOfCallbacks; i++) {
                var listener = this.listeners[type][i];
                str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
                str += " listen for '" + type + "'\n";
            }
        }
        return str;
    }
};
