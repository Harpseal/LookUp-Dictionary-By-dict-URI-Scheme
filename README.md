A loop-up-dictionary addon for the **modernizing** firefox 57+.

This addon is fork from another firefox addon [Mactionary](https://addons.mozilla.org/en-US/firefox/addon/mactionary/)

## How-to-use
When user right-click on any word on any website, this addon will send the clicked text or selected texts using dict Uri scheme (ex. dict:///keyword) to any supported dictionary software.
The dict:/// Uri scheme is supported by default in macOS. If your OS is Windows or Linux and the GoldenDict is installed, you can use the following scripts to translate the Uri scheme for GoldenDict. Thanks.

* Linux (python + GoldenDict)
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

* Windows (Autohotkey + GoldenDict)
```
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
