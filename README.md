# Node-RED Debounce advanced

```
npm install node-red-contrib-debounce-advanced
```

A node for Node-RED that supports leading (immediate) or trailing (delayed) debounce logic.

Trailing (delayed): wait first, then fire.

Leading (immediate): fire first, then act as trailing.

Forked from telmomarques / node-red-contrib-debounce-leading-trailing, added support for time units, reporting all
states (waiting, last fired time, reset/flush) and updated UI.

v0.0.7 - added flush and reset capabilities to either flush the message immediately or reset the node.
