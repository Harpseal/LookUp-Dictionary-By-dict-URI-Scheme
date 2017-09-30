'use strict';

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/

var contextMenuName = "menuItemDictScheme";
var is_create_menu = false;
var text = null;
var tab_id = null;

/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
      case contextMenuName:
          //console.log("menu on click id:["+tab_id + " text:[" + text + "]");
          if (text !== null && tab_id !== null)
          {
              browser.tabs.sendMessage(tab_id, {
                  topic: "dict-sendText",
                  data: text
              });
          }


          var uri = 'dict:///' + encodeURIComponent(text);
          //console.log("send uri [" + text + "] [" + uri + "]");
          var creating = browser.tabs.create({
              url: uri,
              active: false
          });
          creating.then(function (tab) {
              //console.log('Created new tab: ${tab.id}')
              var removing = browser.tabs.remove(tab.id);
              removing.then(function () {
                  //console.log('Removed');
              }, function (error) {
                  console.log('Removed Error: ${error}');
              });
          }, function (error) {
              console.log('Creating tab Error: ${error}');
          });

          break;
  }
});


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
browser.runtime.onMessage.addListener((message, sender) => {
    let data = Object.assign({}, message.data, { sender: sender });
    switch (message.topic) {
        case 'dict-lookUp':
            //console.log("background : [" + data.text + "]");
            text = data.text;
            tab_id = sender.tab.id;

            var content = browser.i18n.getMessage("contextMenuTitle", shorten(text));
            //console.log(content);

            if (!is_create_menu) {
                browser.menus.create({
                    id: contextMenuName,
                    title: content,
                    enabled: true,
                    contexts: ["all"],
                    icons: {
                        "16": "icons/menu_icon_16.png",
                        "32": "icons/menu_icon_32.png"
                    }
                }, function () {
                    if (browser.runtime.lastError) {
                        console.log('Error: ${browser.runtime.lastError}');
                    } else {
                        is_create_menu = true;
                        //console.log("Item created successfully");
                    }
                });
                is_create_menu = true;
            }
            else
            {
                browser.menus.update(contextMenuName, {
                    title: content,
                    enabled: true
                });
            }

            break;
        case 'dict-disable':
            //console.log("background : dict-disable");
            var removing = browser.menus.remove(contextMenuName);
            removing.then(function () {
                is_create_menu = false;
            }, function () {
                console.log("error removing item:" + browser.runtime.lastError);
            });

            //browser.menus.update(contextMenuName, {
            //    enabled: false
            //});
            break;
    }
    return false;
});

