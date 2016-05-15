(function(root, factory) {
	if (typeof define === 'function' && define.amd)
		define([], factory);
	else if (typeof exports === 'object')
		module.exports = factory();
	else
		root.CreateElement = factory();
})(this, function () {
    var defProps = Object.defineProperties
    var defProp = Object.defineProperty
	var c2d = function (str) { return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() }
	var isStrOrNum = function (val) { var valType = typeof val; return valType === 'string' || valType === 'number' }
    var extend = function (dest) {
        for (var i = 1; i < arguments.length; i++) {
            var src = arguments[i]
            for (var j = 0; j < src.length; j++)
                dest.push(src[j])
        }
        return dest
    }
    
    var dbqRegex = /"/g
    var Attributes = (function () {
        var Attributes = function (node) {
            defProps(this, {
                _holder: { value: {} },
                _node: { value: node }
            })
        }
        defProps(Attributes.prototype, {
            value: {
                get: function () {
                    var result = ''
                    var keys = Object.keys(this)
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i]
                        var val = this[key]
                        if (val)
                            result += ' ' + key + '="' + val.replace(dbqRegex, '\'') + '"'
                    }
                    if (keys.indexOf('id') === -1) {
                        var nodeId = this._node._id
                        if (nodeId)
                            result = ' id="' + nodeId + '"' + result
                    }
                    if (keys.indexOf('class') === -1) {
                        var nodeClass = this._node.className
                        if (nodeClass)
                            result = ' class="' + nodeClass + '"' + result
                    }
                    return result
                }
            }
        })
        return Attributes
    })()
    
    var normalStyles = ['color', 'display', 'white-space', 'whiteSpace', 'overflow', 'overflow-x', 'overflow-y', 'overflowX', 'overflowY']
    var pxRegex = /^\s*[0-9]+px\s*$/
    var pxOrPcRegex = /^([0-9]+px)|([0-9]+%)$/
    var styleWithPxOrPc = ['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight']
    var positions = ['Top', 'Right', 'Bottom', 'Left']
    !(function () {
        var styleWithPxAndPosition = ['margin', 'padding']
        for (var i = 0; i < styleWithPxAndPosition.length; i++) {
            var name = styleWithPxAndPosition[i]
            styleWithPxOrPc.push(name) 
            for (var j = 0; j < positions.length; j++) {
                var realName = positions[j]
                styleWithPxOrPc.push(name + realName)
            }
        }
    })()
    var fontCss = ['', 'Family', 'FeatureSettings', 'Kerning', 'Size', 'Stretch', 'Style', 'Variant', 'VariantLigatures', 'Weight']
    var bgCss = ['', 'Attachment', 'BlendMode', 'Clip', 'Color', 'Image', 'Origin', 'Position', 'PositionX', 'PositionY', 'Repeat', 'RepeatX', 'RepeatY', 'Size']
    !(function () {
        for (var a = 0; a < fontCss.length; a++)
            normalStyles.push('font' + fontCss[a])
        for (var b = 0; b < bgCss.length; b++)
            normalStyles.push('background' + bgCss[b])
    })()
    
    var defStylePxProp = function (obj, name) {
        defProp(obj, name, {
            get: function () { return this._holder[name] || '' },
            set: function (val) {
                val = (''+val).trim()
                this._holder[name] = pxOrPcRegex.test(val) ? val : ''
            }
        })
    }
    var defNormalStyleProp = function (obj, name) {
        defProp(obj, name, {
            get: function () { return this._holder[name] || '' },
            set: function (val) {
                val = (''+val).trim()
                this._holder[name] = val
            }
        })
    }
    
    var Style = (function () {
        var Style = function (node) {
            defProps(this, {
                _holder: { value: {} },
                _node: { value: node }
            })
        }
        for (var a = 0; a < styleWithPxOrPc.length; a++) {
            defStylePxProp(Style.prototype, styleWithPxOrPc[a])
        }
        for (var b = 0; b < normalStyles.length; b++) {
            defNormalStyleProp(Style.prototype, normalStyles[b])
        }
        defProps(Style.prototype, {
            value: {
                get: function () {
                    var result = ''
                    var keys = Object.keys(this._holder)
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i]
                        var val = this._holder[key]
                        if (val)
                            result += c2d(key) + ':' + val + ';'
                    }
                    return result
                }
            }
        })
        return Style
    })()
    
    var validNodeNameRegex = /^[a-z_][a-z-_]*$/
    var stripHtmlRegex = /<(?:.|\n)*?>/gm
    var Node = (function () {
        /**
         * Create object that mimics html element in non browser environment
         * @param {String} name 
         * @param {Boolean} isTextNode 
         */
        var Node = function (name, isTextNode) {
            if ((!name || !validNodeNameRegex.test(name)) && !isTextNode) throw new Error('Invalid node')
            if (isTextNode)
                defProps(this, {
                    isTextNode: { value: true },
                    nodeValue: { value: name }
                })
            else {
                defProps(this, {
                    _class: { value: '', writable: true },
                    _id: { value: '', writable: true },
                    _children: { value: [], writable: true },
                    localName: { value: isTextNode ? '' : name, enumerable: true }
                })
                this.attributes = new Attributes(this)
                this.style = new Style(this)
            }
        }
        defProps(Node.prototype, {
            className: {
                get: function () { return this._class },
                set: function (val) {
                    if (!isStrOrNum(val)) return false;
                    this._class = '' + val
                    return this._class
                },
                enumerable: true
            },
            id: {
                get: function () { return this._id },
                set: function (val) {
                    if (!isStrOrNum(val)) return false;
                    this._id = '' + val
                    return this._id
                },
                enumerable: true
            },
            setAttribute: {
                value: function (name, value) {
                    if (!isStrOrNum(name)) return false;
                    this.attributes[c2d(name)] = value
                }
            },
            getAttribute: {
                value: function (name, value) {
                    if (!isStrOrNum(name)) return '';
                    return this.attributes[c2d(name)] || ''
                }
            },
            childNodes: {
                get: function () {
                    return extend([], this._children)
                }
            },
            children: {
                get: function () {
                    return extend([], this._children)
                }
            },
            firstChild: {
                get: function () {
                    return this._children[0] || null
                }
            },
            lastChild: {
                get: function () {
                    return this._children[this._children.length - 1] || null
                }
            },
            textContent: {
                get: function () {
                    return this.toString().replace(stripHtmlRegex, '')
                },
                set: function (val) {
                    this._children.length = 0
                    this._children.push(new Node(val, true))
                }
            },
            appendChild: {
                value: function (child) {
                    if (child instanceof Node === false) throw new Error('Cannot execute. Argument provided is not the type of Node')
                    this._children.push(child)
                    return child
                }
            },
            removeChild: {
                value: function (child) {
                    if (child instanceof Node === false) throw new Error('Cannot execute. Parameter is not the type of Node')
                    var cIdx = this._children.indexOf(child)
                    if (cIdx === -1) throw new Error('Cannot execute. Parameter is not the type of Node')
                    this._children.splice(child, 1)
                    return child
                }
            },
            innerHTML: {
                get: function () {
                    var html = ''
                    for (var i = 0; i < this._children.length; i++)
                        html += this._children[i]
                    return html
                }
            },
            toString: {
                value: function () {
                    if (this.isTextNode) return this.nodeValue
                    var styleValue = this.style.value
                    var styleAttr = styleValue ? (' style="' + styleValue + '"') : ''
                    var openTag = '<' + this.localName + this.attributes.value + styleAttr + '>'
                    var closeTag = '</' + this.localName + '>'
                    var childrenHtml = ''
                    for (var i = 0; i < this._children.length; i++)
                        childrenHtml += this._children[i]
                    return openTag + childrenHtml + closeTag
                }
            }
        })
        
        return Node
    })()
    
    var htmlElement = new Node('html')
    defProps(htmlElement, {
        head: {
            value: new Node('head'),
            enumerable: true
        },
        body: {
            value: new Node('body'),
            enumerable: true
        }
    })
    
    /**
     * @fake document, mimic document behavior
     */
    var fakecument = {
        document: {
            documentElement: htmlElement,
            /**
             * @Mimic html element
             * @param {String} name
             */
            createElement: function (name) {
                return new Node(name)
            },
            /**
             * @Mimic html text node
             * @param {String} val text content 
             */
            createTextNode: function (val) {
                return new Node(val, true)
            },
        },
        Node: Node
    }
    
    return fakecument
})