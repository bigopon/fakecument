## Fakecument
Helper to mimic document behavior on node environment

Basic feature list:

 * document.createElement
 * appendChild
 * removeChild
 * style & attribute serialization
 * to Html string via toString()

## Examples
```javascript
var fakecument = require('fakecument')
var doc = fakecument.document
var root = doc.createElement('div')
root.className = 'root'
var child = doc.createElement('div')
child.className = 'child'
child.style.width = '100px'
root.appendChild(child)

console.log(''+root) // <div class="root"><div class="child" style="width:100px"></div></div>
```

## Motivation
- Helper for `dominic` to render on server

## Installation
```javascript
npm i fakecument
```

## API

## License
.MIT
