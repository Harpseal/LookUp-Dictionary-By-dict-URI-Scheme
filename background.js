'use strict';

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Chrome 1+
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/

var contextMenuName = "menuItemDictScheme";
var contextMenuController;
var is_create_menu = false;
var text = null;
var tab_id = null;
var browser_version = null;

var gettingInfo = browser.runtime.getBrowserInfo();
gettingInfo.then(function (info) {
    const parsed = parseInt(info.version, 10);
    if (!isNaN(parsed))
        browser_version = parsed;
    console.log(info.version,browser_version);
});

//console.log("background.js isFirefox:" + isFirefox + " isChrome:" + isChrome);

contextMenuController = isFirefox ? browser.menus : isChrome ? chrome.contextMenus : null;

/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/

var menuOnClickFirefox = function (info, tab) {
    switch (info.menuItemId) {
        case contextMenuName:
            //console.log("menu on click id:["+tab_id + " text:[" + text + "]");
            if (text !== null && tab_id !== null) {
                browser.tabs.sendMessage(tab_id, {
                    topic: "dict-sendText",
                    data: text
                });
            }

            var uri = 'dict:///' + encodeURIComponent(text);
            //console.log("send uri [" + text + "] [" + uri + "]");
            var creating = browser.tabs.create({
                url: uri,
                active: false,
                discarded: false
            });
            creating.then(function (tab) {
                //console.log('created new tab: '+tab.id)

                function onGot(item) {
                    var is_keep_tab = browser_version && browser_version>=84;
                    if (item.checkbox_keeptab != null) {
                        is_keep_tab = item.checkbox_keeptab
                    }
                    console.log('keep:' + is_keep_tab);
                    if (!is_keep_tab)
                    {
                        window.setTimeout(function (){
                            var removing = browser.tabs.remove(tab.id);
                            removing.then(function () {
                                //console.log('Removed');
                                var removing_menus = contextMenuController.remove(contextMenuName);
                                removing_menus.then(function () {
                                    is_create_menu = false;
                                }, function () {
                                    console.log("error removing item:" + browser.runtime.lastError);
                                });
                            }, function (error) {
                                console.log('Removed Error: ${error}');
                            });
                        },30);
                    }
                }

                let getting = browser.storage.sync.get("checkbox_keeptab");
                getting.then(onGot, function (error) {
                    console.log('Error: ${error}')
                });

            }, );

            break;
    }
};

var menuOnClickChrome = function (info, tab) {
    switch (info.menuItemId) {
        case contextMenuName:
            //console.log("menu on click id:["+tab_id + " text:[" + text + "]");
            if (text !== null && tab_id !== null) {
                chrome.tabs.sendMessage(tab_id, {
                    topic: "dict-sendText",
                    data: text
                });
            }

            var uri = 'dict:///' + encodeURIComponent(text);
            console.log("send uri [" + text + "] [" + uri + "]");
            //chrome.tabs.create({ url: uri });
            //chrome.windows.create({ url: uri, width: 520, height: 660 });
            break;


    }
};

if (contextMenuController != null) {
    if (isFirefox)
        contextMenuController.onClicked.addListener(menuOnClickFirefox);
    else if (isChrome)
        contextMenuController.onClicked.addListener(menuOnClickChrome);
}



var shorten = function (t) {
    if (t.length > 26) {
        var words = t.split(" ");
        if (words.length >= 2)
        {
            var res_start = words[0];
            var res_end = words[words.length - 1];

            if (res_start.length + res_end.length <= 23)
            {
                for (var s = 1, e = words.length - 2; s < words.length / 2 - 1 && s != e; s++ , e--) {
                    if (res_start.length + words[s].length + res_end.length <= 23)
                        res_start += " " + words[s];
                    else
                        break;
                    if (res_start.length + res_end.length + words[e].length <= 23)
                        res_end += " " + words[e];
                    else
                        break;
                }
                //console.log("shorten first try : [" + res_start + "] [" + res_end + "]");
                return res_start + "..." + res_end;
            }
        }
        return t.substr(0, 12) + '...' + t.substr(t.length - 12);
    }
    return t;
};

// Handle messages from the content script.
var handleMessage = function(message, sender) {
    let data = Object.assign({}, message.data, { sender: sender });
    console.log("message : [" + message.topic + "]");
    switch (message.topic) {
        case 'dict-lookUp':
            console.log("background : [" + data.text + "]");
            text = data.text;
            tab_id = sender.tab.id;

            var content = isFirefox ? browser.i18n.getMessage("contextMenuTitle", shorten(text)) :
                isChrome ? chrome.i18n.getMessage("contextMenuTitle", shorten(text)) : "Not supported.";

            console.log("content:" + content);

            if (!is_create_menu) {
                var menu_item = {
                    id: contextMenuName,
                    title: content,
                    enabled: true,
                    contexts: ["all"],
                };

                if (isFirefox)
                    menu_item.icons = {
                        "16": "icons/menu_icon_16.png",
                        "32": "icons/menu_icon_32.png"
                    };

                contextMenuController.create(menu_item, function () {
                    if (isFirefox && browser.runtime.lastError) {
                        console.log('Error: ${browser.runtime.lastError}');
                    } else if (isChrome && chrome.runtime.lastError) {
                        console.log('Error: ' + chrome.runtime.lastError);
                    }
                    else {
                        is_create_menu = true;
                        //console.log("Item created successfully");
                    }
                });
                is_create_menu = true;
            }
            else {
                contextMenuController.update(contextMenuName, {
                    title: content,
                    enabled: true
                });
            }

            break;
        case 'dict-disable':
            //console.log("background : dict-disable");
            if (is_create_menu) {
                var removing = contextMenuController.remove(contextMenuName);
                if (isFirefox) {
                    removing.then(function () {
                        is_create_menu = false;
                    }, function () {
                        console.log("error removing item:" + browser.runtime.lastError);
                    });
                }
                else
                    is_create_menu = false;
            }
            break;
    }
    return false;
};


browser.runtime.onMessage.addListener(handleMessage);
//if (isFirefox)
//    browser.runtime.onMessage.addListener(handleMessage);
//else if (isChrome)
//    chrome.extension.onMessage.addListener(handleMessage);

