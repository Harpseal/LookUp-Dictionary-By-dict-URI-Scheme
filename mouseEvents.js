'use strict';

var offsetText = null;
var offset = -1;


// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Chrome 1+
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

console.log("mouseEvent.js isFirefox:" + isFirefox + " isChrome:" + isChrome);

var sendToBackground = function (text)
{
    if (text === null)
    {
        console.log("sendToBackground is null");

        if (isChrome)
            chrome.extension.sendMessage({
                topic: 'dict-disable'
            });
        else if (isFirefox)
            browser.runtime.sendMessage({
                topic: 'dict-disable'
            });
    }
    else
    {
        console.log("sendToBackground : [" + text + "]");
        if (isChrome)
            chrome.extension.sendMessage({
                topic: 'dict-lookUp',
                data: {
                    text: text
                }
            });
        else if (isFirefox)
            browser.runtime.sendMessage({
                topic: 'dict-lookUp',
                data: {
                    text: text
                }
            });
    }     
}

var getText = function (text, selected_offset) {
    var selection = window.getSelection();
    if (!selection.isCollapsed) {
        var text = [];
        for (var i = 0, l = selection.rangeCount; i < l; i++) {
            var word = selection.getRangeAt(i).toString().trim();
            word && text.push(word);
        }
        return text.length ? text.join(' ') : null;
    } else if (text && selected_offset >= 0) {
        var text = text;
        if (!text[selected_offset] || /\s/.test(text[selected_offset])) {
            return null;
        }
        var start = selected_offset;
        var end = selected_offset;

        while (start > 0 && /\S/.test(text[start - 1])) { start--; }
        while (end < text.length && /\S/.test(text[end])) { end++; }

        return text.substring(start, end);
    } else {
        //var text = node.textContent || '';
        //return text.trim() || null;
    }
};

// This might not happen on the first right-click for the context menu.

if (isFirefox) {
    window.addEventListener('mousedown', function (event) {
        console.log("event.button " + event.button);
        if (event.button === 2 &&
            event.rangeOffset != null &&
            event.rangeParent &&
            event.rangeParent.parentNode === event.target &&
            event.rangeParent.nodeType === event.rangeParent.TEXT_NODE) {

            offsetText = event.rangeParent.textContent;
            offset = event.rangeOffset;

            var text = getText(offsetText, offset);

            console.log("mouseDown [" + offsetText + "]=>[" + text + "]" + offset);

            sendToBackground(text);
        } else {
            offsetText = null;
            offset = -1;
            sendToBackground(null);
        }
    } , true);
    
    browser.runtime.onMessage.addListener(request => {
        //console.log("browser.runtime.onMessage:" + request.topic + " " + request.data);
        switch (request.topic) {
            case 'dict-lookUp':
                if (!request.data) { break; }
                //var uri = 'dict:///' + encodeURIComponent(request.data);
                break;
            case 'dict-sendText':
                if (!request.data) { break; }
                var uri = 'dict:///' + encodeURIComponent(request.data);
                console.log("send uri (content) [" + request.data + "] [" + uri + "]");
                break;
        }
        //console.log(request.greeting);
        //return Promise.resolve({ response: "Hi from content script" });
    });
}
else if (isChrome) {
    document.addEventListener('mousedown', function (event) {
        if (event.button === 2 && event.target.firstChild != null && event.target.firstChild.nodeType == event.target.TEXT_NODE) {
            var elem = event.target.firstChild;

            var text_found = false;
            var text = "";

            while (elem != null && !text_found) {
                var range = elem.ownerDocument.createRange();
                range.selectNodeContents(elem);
                var currentPos = 0;
                var endPos = range.endOffset;

                var x = event.clientX;
                var y = event.clientY;
                while (currentPos + 1 < endPos && !text_found) {
                    range.setStart(elem, currentPos);
                    range.setEnd(elem, currentPos + 1);
                    if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                        range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                        //range.expand("word");

                        offsetText = elem.textContent;
                        offset = currentPos;

                        text = getText(offsetText, offset);
                        text_found = true;
                        range.detach();
                        currentPos = endPos;
                    }
                    currentPos += 1;
                }
                if (!text_found)
                    elem = elem.nextSibling;
            }
            console.log("result:[" + text + "]");


            if (text_found) {


                //var text = ;

                if (text !== null && text !== undefined)
                    text = text.replace(/\s{2,}/g, ' ');
                else
                    console.error("getText Error[" + offsetText + "]" + offset);

                console.log("mouseDown [" + offsetText + "]");
                console.log("=>[" + text + "]" + offset);
                sendToBackground(text);
            }
            else
            {
                offsetText = null;
                offset = -1;
                sendToBackground(null);
            }


        } else {
            offsetText = null;
            offset = -1;
            sendToBackground(null);
        }
    }, true);

    chrome.extension.onMessage.addListener(request => {
        //console.log("browser.runtime.onMessage:" + request.topic + " " + request.data);
        switch (request.topic) {
            case 'dict-lookUp':
                if (!request.data) { break; }
                //var uri = 'dict:///' + encodeURIComponent(request.data);
                break;
            case 'dict-sendText':
                if (!request.data) { break; }
                var uri = 'dict:///' + encodeURIComponent(request.data);
                console.log("send uri (chrome) [" + request.data + "] [" + uri + "]");

                var w = (window.parent) ? window.parent : window;
                w.location.assign(uri);
                sendToBackground(null);
                //navigator.registerProtocolHandler("dict", uri, "dict");

                break;
        }

    });
}

