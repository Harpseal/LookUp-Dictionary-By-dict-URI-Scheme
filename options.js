
function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      checkbox_keeptab: document.querySelector("#checkbox_keeptab").checked
    });
    document.getElementById('info_saved').innerHTML = 'saved.';
    window.setTimeout(function (){
        document.getElementById('info_saved').innerHTML = "";
    },1000);
  }

function restoreOptions() {
    function setCurrentChoice(result) {
        var gettingInfo = browser.runtime.getBrowserInfo();
        gettingInfo.then(function (info) {
            var browser_version = null;
            const parsed = parseInt(info.version, 10);
            if (!isNaN(parsed))
                browser_version = parsed;
            var checked = (browser_version != null && browser_version>=84);
            if (result.checkbox_keeptab != null)
                checked = result.checkbox_keeptab;
            document.querySelector("#checkbox_keeptab").checked = checked;
        });
    }

    function onError(error) {
        console.log('Error: ${error}');
    }

    let getting = browser.storage.sync.get("checkbox_keeptab");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);