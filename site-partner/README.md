# Chrome extension PoC

This extension checks if the active window contains a site the extension is interested in. If yes, it injects a script. The injected script (after completing whatever it wants to do) sends a message to the extension.

In this example, the extension is interested in all .com sites. The injected script gets the title of the window and sends it as part of a message to the extension.