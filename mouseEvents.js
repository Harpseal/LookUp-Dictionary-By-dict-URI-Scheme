'use strict';

var offsetText = null;
var offset = -1;

var sendToBackground = function (text)
{
    if (text === null)
    {
        //console.log("sendToBackground is null");
        browser.runtime.sendMessage({
            topic: 'dict-disable'
        });

    }
    else
    {
        //console.log("sendToBackground : [" + text + "]");
        browser.runtime.sendMessage({
            topic: 'dict-lookUp',
            data: {
                text: text
            }
        });
    }     
}

var getText = function (text, offset) {
    var selection = window.getSelection();
    if (!selection.isCollapsed) {
        var text = [];
        for (var i = 0, l = selection.rangeCount; i < l; i++) {
            var word = selection.getRangeAt(i).toString().trim();
            word && text.push(word);
        }
        return text.length ? text.join(' ') : null;
    } else if (text && offset >= 0) {
        var text = text;
        if (!text[offset] || /\s/.test(text[offset])) {
            return null;
        }
        var start = offset;
        var end = offset;

        while (start > 0 && /\S/.test(text[start - 1])) { start--; }
        while (end < text.length && /\S/.test(text[end])) { end++; }

        return text.substring(start, end);
    } else {
        //var text = node.textContent || '';
        //return text.trim() || null;
    }
};

// This might not happen on the first right-click for the context menu.
window.addEventListener('mousedown', function (event) {
    if (event.button === 2 &&
        event.rangeOffset != null &&
        event.rangeParent &&
        event.rangeParent.parentNode === event.target &&
        event.rangeParent.nodeType === event.rangeParent.TEXT_NODE) {

        offsetText = event.rangeParent.textContent;
        offsetText = offsetText.replace(/\s{2,}/g, ' ');

        offset = event.rangeOffset;
        sendToBackground(getText(offsetText, offset));
    } else {
        offsetText = null;
        offset = -1;
        sendToBackground(null);
    }
}, true);



browser.runtime.onMessage.addListener(request => {
    console.log("browser.runtime.onMessage:" + request.topic + " " + request.data);
    switch (request.topic)
    {
        case 'dict-lookUp':
            if (!request.data) { return; }
            //var uri = 'dict:///' + encodeURIComponent(request.data);
            break;
    }
    //console.log(request.greeting);
    //return Promise.resolve({ response: "Hi from content script" });
});
