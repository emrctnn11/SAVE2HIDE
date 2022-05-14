
var configResult = {};

configResult.tabList = [];

configResult.processResult = true;

configResult.dummyData = null;

configResult.IsActive = null;

configResult.UI = {

    "urlResult": chrome.runtime.getURL("src/settings/opt.html")

};

configResult.welcomeResult = {
    set lastupdate(val) {
        
        app.storage.write("lastupdate", val);

    },

    get lastupdate() {
        var result = app.storage.look("lastupdate") !== undefined ? app.storage.look("lastupdate") : 0;

        return result;
    }
};

var app = {};

app.hotkey = {
    "on": {

        "pressed": function (callback) {
            chrome.commands.onCommand.addListener(function (e) {

                if (e && callback) {
                    callback(e);
                }

            });
        }
    }
};

app.on = {
    "direct": function (callback) {
        chrome.management.getSelf(callback);
    },

    "onInstall": function (callback) {
        chrome.runtime.onInstalled.addListener(function (e) {

            app.storage.load(function () {
                callback(e);
            });

        });
    },

    "unInstall": function (url) {
        chrome.runtime.setUninstallURL(url, function () {

        });
    },

    "onStart": function (callback) {
        chrome.runtime.onStartup.addListener(function (e) {

            app.storage.load(function () {
                callback(e);
            });

        });
    },

    "alert": function (callback) {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            app.storage.load(function () {
                callback(message, sender, sendResponse);
            });

            return true;
        });
    }
};

app.storage = (function () {
    chrome.storage.onChanged.addListener(function () {

        chrome.storage.local.get(null, function (e) {

            app.storage.local = e;

            if (app.storage.cBack && typeof app.storage.cBack === "function") {

                app.storage.cBack(true);

            }

        });
    });

    return {

        "local": {},

        "cBack": null,

        "write": function (id, data, callback) {

            var tempData = {};

            tempData[id] = data;

            app.storage.local[id] = data;

            chrome.storage.local.set(tempData, function (e) {
                if (callback) {
                    callback(e);
                }
            });
        },

        "look": function (id) {

            var idresult = app.storage.local[id];

            return idresult;
        },

        "active": {
            "changed": function (callback) {

                if (callback) {
                    app.storage.cBack = callback;
                }

            }
        },

        "load": function (callback) {
            var s = Object.keys(app.storage.local);

            if (s && s.length) {
                if (callback) {
                    callback("cache");
                }
            } else {
                chrome.storage.local.get(null, function (e) {
                    app.storage.local = e;

                    if (callback) {
                        callback("disk");
                    }

                });
            }
        }
    }
})();

app.button = {
    

    "icon": function (tabId, path, callback) {
        if (path && typeof path === "object") {

            var optionsResult = { "path": path };

            if (tabId) {

                optionsResult["tabId"] = tabId;

            }

            chrome.action.setIcon(optionsResult, function (e) {
                if (callback) {
                    callback(e);
                }
            });

        } else {

            var optionsResult = {
                "path": {
                    "16": "../src/assets/images/" + (path ? path + '/' : '') + "16.png",
                    "32": "../src/assets/images/" + (path ? path + '/' : '') + "32.png",
                    "48": "../src/assets/images/" + (path ? path + '/' : '') + "48.png",
                    "64": "../src/assets/images/" + (path ? path + '/' : '') + "64.png"
                }
            };

            if (tabId) {
                optionsResult["tabId"] = tabId;
            }

            chrome.action.setIcon(optionsResult, function (e) {
                if (callback) {
                    callback(e);
                }
            });
        }
    },

    "arma": {
        "text": function (tabId, badge, callback) {

            if (tabId) {
                chrome.action.setBadgeText({
                    "tabId": tabId,
                    "text": badge + ''
                }, function (e) {

                    var lasterror = chrome.runtime.lastError;
                    console.log(lasterror);

                    if (callback) {
                        callback(e);
                    }
                });
            }
            else {
                chrome.action.setBadgeText({ "text": badge + '' }, function (e) {

                    var lasterror = chrome.runtime.lastError;
                    console.log(lasterror);

                    if (callback) {
                        callback(e);
                    }
                });
            }
        }
    },

    "active": {

        "clicked": function (callback) {

            chrome.action.onClicked.addListener(function (e) {

                app.storage.load(function () {
                    callback(e);
                });

            });
        }
    },

    
};

app.tab = {
    "trash": function (tabId, callback) {
        chrome.tabs.remove(tabId, function (e) {

            if (callback) {
                callback(e);
            }

        });
    },

    "onUpdate": function (tabId, options, callback) {
        chrome.tabs.update(tabId, options, function (e) {

            if (callback) {
                callback(e);
            }

        });
    },

    "restore": function (id, callback) {
        if (chrome.sessions) {

            chrome.sessions.restore(id, function (session) {
                if (session && callback) {
                    callback(session);
                }
            });

        }
    },
    "open": function (url, index, active, callback) {

        var properties = {
            "active": active !== undefined ? active : true,
            "url": url
        };

        if (index !== undefined) {
            if (typeof index === "number") {

                properties.index = index + 1;

            }
        }

        chrome.tabs.create(properties, function (tab) {

            if (callback) {
                callback(tab);
            }

        });
    },
    "query": {

        "all": function (callback) {
            chrome.tabs.query({}, function (tabs) {

                if (tabs && tabs.length) {
                    callback(tabs);
                }

            });
        },

        "onIndex": function (callback) {
            chrome.tabs.query({ "active": true, "currentWindow": true },
                function (tabs) {

                    if (tabs && tabs.length) {
                        callback(tabs[0].index);
                    } else {
                        callback(undefined);
                    }

                });
        },

        "off": function (callback) {
            if (chrome.sessions) {

                chrome.sessions.getRecentlyClosed(function (sessions) {

                    if (sessions && sessions.length) {
                        callback(sessions);
                    }

                });

            }
        }
    },

    "on": {

        

        "trash": function (callback) {
            chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {

                app.storage.load(function () {
                    callback(tabId);
                });

            });
        },

        "onUpdate": function (callback) {
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

                app.storage.load(function () {

                    if (tab.status === "complete") {
                        callback(tab);
                    }

                });

            });
        },

        "onActivated": function (callback) {
            chrome.tabs.onActivated.addListener(function (activeInfo) {

                app.storage.load(function () {

                    chrome.tabs.get(activeInfo.tabId, function (tab) {
                        callback(tab);
                    });

                });

            });
        },

        
    }
};



app.homepage = function () {
    var u = chrome.runtime.getManifest().homepage_url

    return u;
};
app.version = function () {
    var v = chrome.runtime.getManifest().version

    return v;
};

if (!navigator.webdriver) {

    app.on.unInstall(app.homepage() + "?v=" + app.version() + "&type=uninstall");

    app.on.onInstall(function (e) {
        app.on.direct(function (result) {

            if (result.installType === "normal") {

                app.tab.query.onIndex(function (index) {

                    var pResult = e.previousVersion !== undefined && e.previousVersion !== app.version();

                    var lupdate = pResult && parseInt((Date.now() - configResult.welcomeResult.lastupdate) / (24 * 3600 * 1000)) > 45;

                    if (e.reason === "install" || (e.reason === "update" && lupdate)) {

                        var p = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;

                        var result = app.homepage() + "?v=" + app.version() + p;

                        app.tab.open(result, index, e.reason === "install");

                        configResult.welcomeResult.lastupdate = Date.now();

                    }

                });

            }

        });
    });

}


var result = {
    
    "hide": {
        "tabs": function () {
            if (configResult.processResult) {

                app.tab.query.all(function (tabs) {

                    if (tabs && tabs.length) {

                        var aResult = tabs;

                        var cResult = tabs && tabs.length === 1;

                        var bResult = configResult.dummyData;

                        var dResult = configResult.dummyData && tabs[0].id === configResult.dummyData.id;

                        if (aResult && bResult && cResult && dResult) {

                            app.tab.query.off(function (sessions) {

                                var _restore = function (session) {
                                    app.tab.restore(session.tab.sessionId, function () {

                                        count = count + 1;

                                        if (count === 1 && configResult.dummyData) {
                                            app.tab.trash(configResult.dummyData.id);
                                        }

                                        var valid = sessions.length && count < configResult.tabList.length;

                                        if (valid) {

                                            _restore(sessions.shift());

                                        }
                                        else {
                                            configResult.processResult = true;

                                            app.tab.query.all(function (tabs) {
                                                for (var i = 0; i < tabs.length; i++) {

                                                    if (i === configResult.IsActive) {
                                                        app.tab.onUpdate(tabs[configResult.IsActive].id, { "active": true });
                                                    }
                                                }
                                            });

                                        }
                                    });

                                };

                                var count = 0;

                                app.button.icon(null, null);

                                configResult.processResult = false;

                                app.button.arma.text(null, '');

                                sessions.length ? _restore(sessions.shift()) : configResult.processResult = true;

                            });
                        } else {

                            configResult.tabList = tabs;
                            app.tab.open(configResult.UI.urlResult, undefined, true, function (tab) {

                                configResult.dummyData = tab;

                                app.button.icon(null, "empty");

                                app.button.arma.text(null, configResult.tabList.length);

                                for (var i = 0; i < configResult.tabList.length; i++) {

                                    if (configResult.tabList[i].IsActive) {
                                        configResult.IsActive = i;
                                    }

                                    app.tab.trash(configResult.tabList[i].id, function () {

                                        var error = chrome.runtime.lastError;
                                        console.log(error);

                                    });
                                }
                            });

                        }
                    }
                });
            }
        }
    },

    "onLoad": function () {
        app.button.icon(null, null);
    },

    "onInstall": function () {
        result.onLoad();
    },

    "begin": function () {
        result.onLoad();
    }

    
};

app.hotkey.on.pressed(function (key) {
    if (key === "hide_tabs") {
        result.hide.tabs();
    }
});

app.on.onStart(result.begin);

app.on.onInstall(result.onInstall);

app.button.active.clicked(result.hide.tabs);