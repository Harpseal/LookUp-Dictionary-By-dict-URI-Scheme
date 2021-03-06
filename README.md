﻿A loop-up-dictionary addon for the Firefox 57+.

This addon is forked from another firefox addon [Mactionary](https://addons.mozilla.org/en-US/firefox/addon/mactionary/)

<br>

**Update for firefox 84+ users**

There is a new permission dialog to approve after firefox 84+.

Please open the Options page of this addon, check the checkbox, press the save button and try to look up some word.
The temporary tab for dict scheme will not be closed and leave the permission dialog for user to approve.

After the permission is approved, please uncheck this checkbox in the Option page for normal use.

For more detail pleace check the [How-to-use step4](#permission-guide).

<br>

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

Python installed by default on Linux. If your OS is Windows, Autohotkey is recommended. Because Firefox only support to call EXE application on windows, you need to compiler the ahk script to EXE by using the Autohotkey compiler. Please download Autohotkey .zip from its website (https://autohotkey.com/download/) and unzip it, the compiler named Ahk2Exe.exe is in the "Compiler" folder.

Before taking the next step, you should check the script is work properly. To test the script, you can execute in the terminal with with uri scheme as the only one parameter.
ex:
```terminal
C:\Tools> look_up_dict.exe dict:///test
```

Make sure the dictionary is showed with the word after the dict:/// correctly.

<br>

**2. Add dict:/// Uri scheme handler**

After some version of Firefox 57+, **Firefox ignores all unknown URI scheme (ex.dict:/// on Win/Linux) and doesn't show the "Launch Application" window as before**, so we have to add it by ourselves. In order to know how to deal with different types of files and URI schemes, Firefox have a internal list to save the action for each content type. The list is showed in Options->Applications. Unfortunately, even if user can change the actions in Options, Firefox doesn't support add or remove file types. We have to edit the list manually. Please take the following steps:

2.1. Open your Firefox profile folder <br>
Click the firefox menu button, click Help and select Troubleshooting Information. The Troubleshooting Information tab will open.
Under the Application Basics section, click on Open Folder. Your profile folder will open.

2.2. Close firefox <br>

2.3. Edit "handlers.json" <br>
Please copy a backup before editing.
Add ```,"dict":{"action":4,"ask":true}``` in the end of json. Please check there are only three } in the end of file.

ex.
```json
...,"itmss":{"action":4,"ask":true},"gameon":{"action":4,"ask":true},"dict":{"action":4,"ask":true}}}
```

<br>

**3. Install this addon.**

After installation, your can try to right click on any text, the "Look up in dictionary" will appear in the context menu. If this is the first time you try to use this addon, a windows named "Launch Application" should open (showed as the following screenshot), please choose the script/exe which you make in the first step.

![Launch_Application](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot_launch_application.png)


If the "Launch Application" is not showed, please open the firefox's Options and scroll down to "Applications" section (or search). The ```dict``` is should in the list with question mark.

![Firefox_options](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/options_0.png)

Click ```Use other...``` to select your wrapper script.

![Firefox_options](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/options_1.png)

The different of ```dict:///``` uri scheme showed in address bar before/after setting the handler.
|    Before    |   After   |
|:----------:|:-----------:|
| ![address_bar_0](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/address_bar_0.png)| ![address_bar_1](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/address_bar_1.png)|


**4. Approve permission to run the wrapper script** (only for firefox 84+) <a href='#permission-guide' id='permission-guide' class='anchor'>></a>

<br>

Look up a keyword at the first time, the temporary tab for dict scheme will not be closed and leave the permission dialog as shown below for user to approve which is a new feature after **firefox 84+**.

If no temporary tab are shown and the wrapper script is not triggered, please open the Options page of this addon and check the checkbox to keep the temporary tab open.

![permission_0](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/permission_0.png)

Please uncheck the checkbox and click the save buttom in the Option page of this addon for normal use.

![permission_1_0](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/permission_1_0.png)

![permission_1_1](https://raw.githubusercontent.com/Harpseal/LookUp-Dictionary-By-dict-URI-Scheme/master/screenshot/permission_1_1.png)

<br>

Kindly reminded that all add-ons will be disable in mozilla's add-ons website (https://addons.mozilla.org) and please try this addon on the other website after the installation is completed.

<br>

GoldenDict is a good freeware. If you don't know how to initialize the GoldenDict and your native language is Chinese, pleace check [this git repo](https://github.com/yanyingwang/goldendict).

<br>

* Linux (python2.x or python3.x + [GoldenDict](http://goldendict.org/))
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
```python
#!/usr/bin/python3
#Author : XenHat (https://github.com/XenHat)
import sys
import urllib
import urllib.parse
from subprocess import call

if len(sys.argv) >= 2:
    text = sys.argv[1]
    if text.startswith("dict:///"):
        text = urllib.parse.unquote(urllib.parse.unquote(text[8:]))
        call(["/usr/bin/goldendict", text])
```
Thanks [XenHat](https://github.com/XenHat) to privide the python3.x script.
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
