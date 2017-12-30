A loop-up-dictionary addon for the Firefox 57+.

This addon is forked from another firefox addon [Mactionary](https://addons.mozilla.org/en-US/firefox/addon/mactionary/)

## Screenshot

![Screenshot](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot.png)

<br>

## How-to-use

When user right-click on any word on any website, the "Look up in dictionary" will appear in the context menu right away. Please select it, and this addon will send the clicked text or selected texts to the dictionary software which supports dict Uri scheme. (ex. dict:///keyword)

The dict:/// Uri scheme is supported by the build-in dictionary software in macOS. If your OS is Windows or Linux, please take the following steps:

<br>

**1. Prepare the "wrapper script" before installing this addon. (require programming skills)**

Prepare the "wrapper script" before installing this addon, because this script is the connection to the outside of the Firefox. There are some example scripts written in Python (for Linux users) and Autohotkey (for Windows users) in the end of this guide, and one more Copy/Paste Autohotkey example in the this addon's github page.

The example scripts still need some customization. Please trace the scripts and customize for your system.

Python installed by default on Linux. If your OS is Windows, Autohotkey is recommended. Because Firefox only support to call EXE application on windows, you need to compiler the ahk script to EXE by using the Autohotkey compiler. Please download Autohotkey .zip from its website (https://autohotkey.com/download/) and unzip it, the compiler named Ahk2Exe.exe is in the "Complier" folder.

Before taking the next step, you should check the script is work properly. To test the script, you can execute in the terminal with with uri scheme as the only one parameter. 
ex:
```terminal
C:\Tools> look_up_dict.exe dict:///test
```

Make sure the dictionary is showed with the word after the dict:/// correctly.

<br>

**2. Add dict:/// Uri scheme handler**

After some version of Firefox 57+, **Firefox ignores all unknown URI scheme (ex.dict:/// on Win/Linux) and doesn't show the "Launch Application" window as before**, so we have to add it by ourselves. In order to know how to deal with different types of files and URI schemes, Firefox have a internal list to save the action for each content type. The list is showed in Options->Applications. Unfortunately, even if user can change the actions in Options, Firefox doesn't support add or remove file types. We have to edit the list manually. Please take the following steps:

2.1. Open your Firefox profile folder
Click the firefox menu button, click Help and select Troubleshooting Information. The Troubleshooting Information tab will open.
Under the Application Basics section, click on Open Folder. Your profile folder will open.

2.2. Close firefox

2.3. Edit "handlers.json"
Please copy a backup before editing.
Add "dict":{"action":4,"ask":true} in the end of json. Please check there are only three } in the end of file. 

ex.
```json
...,"itmss":{"action":4,"ask":true},"gameon":{"action":4,"ask":true},"dict":{"action":4,"ask":true}}}
```

<br>

**3. Install this addon.**

After installation, your can try to right click on any text, the "Look up in dictionary" will appear in the context menu. If this is the first time you try to use this addon, a windows named "Launch Application" should open (showed as the following screenshot), please choose the script/exe which you make in the first step. If nothing happens after clicking (the "Launch Application" don't open), it means uri scheme handler don't work properly, please check the second step.

![Launch_Application](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot_launch_application.png)

Kindly reminded that all add-ons will be disable in mozilla's add-ons website (https://addons.mozilla.org) and please try this addon on the other website after the installation is completed.

<br>

GoldenDict is a good freeware. If you don't know how to initialize the GoldenDict and your native language is Chinese, pleace check [this git repo](https://github.com/yanyingwang/goldendict).

<br>

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

<br>

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
<br>

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
