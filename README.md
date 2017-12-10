A loop-up-dictionary addon for the Firefox 57+.

This addon is forked from another firefox addon [Mactionary](https://addons.mozilla.org/en-US/firefox/addon/mactionary/)

## Screenshot

![Screenshot](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot.png)


## How-to-use

When user right-click on any word on any website, the "Look up in dictionary" will appear in the context menu right away. Please select it, and this addon will send the clicked text or selected texts using dict Uri scheme (ex. dict:///keyword) to any supported dictionary software.

The dict:/// Uri scheme is supported by the build-in dictionary software in macOS. If your OS is Windows or Linux, you can use the following scripts to translate the Uri scheme for the dictionary software (Take GoldenDict as an example).

After some version of Firefox 57+, **Firefox ignores all new custom URI scheme (ex.dict:///) and doesn't show the "Launch application" window as before**, so we have to add it by ourselves. In order to know how to deal with different types of files and URI schemes, Firefox have a internal list to save the action for each content type. The list is showed in Options->Applications. Unfortunately, even if user can change the actions in Options, Firefox doesn't support add or remove file types. We have to edit the list manually. Please take the following steps:

1. Open your Firefox profile folder. Click the firefox menu button, click Help and select Troubleshooting Information. The Troubleshooting Information tab will open. Under the Application Basics section, click on Open Folder. Your profile folder will open.

2. Close firefox.

3. Edit "handlers.json". Please copy a backup before editing. Add ```"dict":{"action":4,"ask":true}``` in the end of json. Please check there are only three } in the end. Ex.
```json
,"itmss":{"action":4,"ask":true},"gameon":{"action":4,"ask":true},"dict":{"action":4,"ask":true}}}
```

4. Retry and the "Launch application" will open.


Kindly reminded that **all addon will be disable on https://*.mozilla.org domain** and please try this addon on the other website after the installation is completed.

GoldenDict is a good freeware. If you don't know how to initialize the GoldenDict and your native language is Chinese, pleace check [this git repo](https://github.com/yanyingwang/goldendict).

* Linux (python + [GoldenDict](http://goldendict.org/))
```python
#!/usr/bin/python
import sys
import urllib
from subprocess import call

if len(sys.argv)>=2:
    text = sys.argv[1]
    if text.startswith("dict:///"):
        text = urllib.unquote(urllib.unquote(text[8:]))
    call(["/usr/bin/goldendict",text])
```

* Windows ([Autohotkey](https://autohotkey.com/) + [GoldenDict for windows](https://github.com/goldendict/goldendict/wiki/Early-Access-Builds-for-Windows))
```Autohotkey
dict_path := "C:\Software\GoldenDict\GoldenDict.exe"
uriDecode(Str)
{
    Static doc := ComObjCreate("HTMLfile")
    Try
    {
        doc.write("<body><script>document.body.innerText = decodeURIComponent(""" . Str . """);</script>")
        Return, doc.body.innerText, doc.body.innerText := ""
    }
}

if %0% < 1  ; The left side of a non-expression if-statement is always the name of a variable.
{
    ExitApp
}

Loop, 1  ; For each parameter:
{
    param := %A_Index%  ; Fetch the contents of the variable whose name is contained in A_Index.
    
    StringLeft, url_scheme, param, 8
    if (url_scheme = "dict:///")
        param := SubStr(param, 9)
        
    param := uriDecode(param)
    Run %dict_path% %param%
}
```


* Windows copy-paste version ([Autohotkey](https://autohotkey.com/) + [YodaoDict(有道词典)](https://www.youdao.com/))
```Autohotkey
;YodaoDict(有道词典)
dict_path := "C:\Software\Youdao\YodaoDict.exe"
dict_workpath := "C:\Software\Youdao\"
dict_appname := "YodaoMainWndClass"

uriDecode(Str)
{
    Static doc := ComObjCreate("HTMLfile")
    Try
    {
        doc.write("<body><script>document.body.innerText = decodeURIComponent(""" . Str . """);</script>")
        Return, doc.body.innerText, doc.body.innerText := ""
    }
}

if %0% < 1  ; The left side of a non-expression if-statement is always the name of a variable.
{
    ExitApp
}

Loop, 1  ; For each parameter:
{
    param := %A_Index%  ; Fetch the contents of the variable whose name is contained in A_Index.
    
    StringLeft, url_scheme, param, 8
    if (url_scheme = "dict:///")
        param := SubStr(param, 9)
        
    Clipboard := uriDecode(param)
    IfWinNotExist ,ahk_class %dict_appname%
    {
        SetWorkingDir, %dict_workpath%
        Run %dict_path%
    }
    else
    {
        IfWinNotActive ,ahk_class %dict_appname%
        {
        WinActivate ,ahk_class %dict_appname%
        Sleep, 200
        }
        Send ^v
        Sleep, 1000
        Send {Enter}
    }
}
```