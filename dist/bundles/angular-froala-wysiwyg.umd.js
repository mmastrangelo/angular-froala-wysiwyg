(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/forms'), require('@angular/core'), require('@angular/common/http'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular-froala-wysiwyg', ['exports', '@angular/forms', '@angular/core', '@angular/common/http', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['angular-froala-wysiwyg'] = {}, global.ng.forms, global.ng.core, global.ng.common.http, global.rxjs, global.rxjs.operators));
}(this, (function (exports, forms, i0, i1, rxjs, operators) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }
    function __classPrivateFieldIn(state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function"))
            throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    }

    /**
     * ScriptLoaderService inserts a script tag into the document containing a script from the specified source.
     */
    var ScriptLoaderService = /** @class */ (function () {
        function ScriptLoaderService(http) {
            this.http = http;
            this.scripts = {};
        }
        ScriptLoaderService.prototype.load = function (id, src) {
            if (this.scripts[id]) {
                return rxjs.of(({ script: id, loaded: true, status: 'Already Loaded' }));
            }
            var script = this.initializeScript(id);
            script.src = src;
            return this.loadAndAppendScript(id, script);
        };
        ScriptLoaderService.prototype.loadWithAuth = function (id, src) {
            var _this = this;
            if (this.scripts[id]) {
                return rxjs.of(({ script: id, loaded: true, status: 'Already Loaded' }));
            }
            var script = this.initializeScript(id);
            return this.getText(src, new i1.HttpHeaders(), new i1.HttpParams()).pipe(operators.switchMap(function (text) {
                script.innerText = text;
                return _this.loadAndAppendScript(id, script);
            }));
        };
        ScriptLoaderService.prototype.unloadScript = function (id) {
            var _a;
            (_a = document.getElementById("script_" + id)) === null || _a === void 0 ? void 0 : _a.remove();
            delete this.scripts[id];
        };
        ScriptLoaderService.prototype.initializeScript = function (id) {
            var script = document.getElementById("script_" + id); // Don't proliferate script tags on revisits
            if (!script) {
                script = document.createElement('script');
            }
            script.id = "script_" + id;
            script.type = 'text/javascript';
            return script;
        };
        ScriptLoaderService.prototype.loadAndAppendScript = function (id, script) {
            var _this = this;
            return new rxjs.Observable(function (subscriber) {
                if (script.src) { // If the script has a URL src, complete the observable when it is loaded; otherwise, assume the source is included as bodycontent and complete immediately
                    if (script.readyState) { // IE
                        script.onreadystatechange = function () {
                            if (script.readyState === "loaded" || script.readyState === "complete") {
                                script.onreadystatechange = null;
                                _this.scripts[id] = true;
                                subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                                subscriber.complete();
                            }
                        };
                    }
                    else { // Others
                        script.onload = function () {
                            _this.scripts[id] = true;
                            subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                            subscriber.complete();
                        };
                    }
                    script.onerror = function (err) { return subscriber.error({ script: id, loaded: false, status: 'Loaded', error: err }); };
                    document.getElementsByTagName('head')[0].appendChild(script);
                }
                else {
                    _this.scripts[id] = true;
                    subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                    subscriber.complete();
                }
            });
        };
        ScriptLoaderService.prototype.getText = function (url, headers, params) {
            return this.http.get(url, {
                headers: headers,
                observe: 'body',
                responseType: 'text',
                params: params,
            });
        };
        return ScriptLoaderService;
    }());
    /** @nocollapse */ ScriptLoaderService.ɵprov = i0.ɵɵdefineInjectable({ factory: function ScriptLoaderService_Factory() { return new ScriptLoaderService(i0.ɵɵinject(i1.HttpClient)); }, token: ScriptLoaderService, providedIn: "root" });
    ScriptLoaderService.decorators = [
        { type: i0.Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    ScriptLoaderService.ctorParameters = function () { return [
        { type: i1.HttpClient }
    ]; };

    var FroalaEditorDirective = /** @class */ (function () {
        function FroalaEditorDirective(el, zone, scriptLoader) {
            this.zone = zone;
            this.scriptLoader = scriptLoader;
            // editor options
            this._opts = {
                immediateAngularModelUpdate: false,
                angularIgnoreAttrs: null
            };
            this.SPECIAL_TAGS = ['img', 'button', 'input', 'a'];
            this.INNER_HTML_ATTR = 'innerHTML';
            this._hasSpecialTag = false;
            this._editorInitialized = false;
            this._oldModel = null;
            // Begin ControlValueAccesor methods.
            this.onChange = function (_) {
            };
            this.onTouched = function () {
            };
            // froalaModel directive as output: update model if editor contentChanged
            this.froalaModelChange = new i0.EventEmitter();
            // froalaInit directive as output: send manual editor initialization
            this.froalaInit = new i0.EventEmitter();
            var element = el.nativeElement;
            // check if the element is a special tag
            if (this.SPECIAL_TAGS.indexOf(element.tagName.toLowerCase()) != -1) {
                this._hasSpecialTag = true;
            }
            this._element = element;
            this.zone = zone;
        }
        FroalaEditorDirective.prototype.ngOnInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.scriptLoader.load("Froala", "../assets/froala_editor.pkgd.min.js")];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // Form model content changed.
        FroalaEditorDirective.prototype.writeValue = function (content) {
            this.updateEditor(content);
        };
        FroalaEditorDirective.prototype.registerOnChange = function (fn) {
            this.onChange = fn;
        };
        FroalaEditorDirective.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        Object.defineProperty(FroalaEditorDirective.prototype, "froalaEditor", {
            // End ControlValueAccesor methods.
            // froalaEditor directive as input: store the editor options
            set: function (opts) {
                this._opts = this.clone(opts || this._opts);
                this._opts = Object.assign({}, this._opts);
            },
            enumerable: false,
            configurable: true
        });
        // TODO: replace clone method with better possible alternate 
        FroalaEditorDirective.prototype.clone = function (item) {
            var me = this;
            if (!item) {
                return item;
            } // null, undefined values check
            var types = [Number, String, Boolean], result;
            // normalizing primitives if someone did new String('aaa'), or new Number('444');
            types.forEach(function (type) {
                if (item instanceof type) {
                    result = type(item);
                }
            });
            if (typeof result == "undefined") {
                if (Object.prototype.toString.call(item) === "[object Array]") {
                    result = [];
                    item.forEach(function (child, index, array) {
                        result[index] = me.clone(child);
                    });
                }
                else if (typeof item == "object") {
                    // testing that this is DOM
                    if (item.nodeType && typeof item.cloneNode == "function") {
                        result = item.cloneNode(true);
                    }
                    else if (!item.prototype) { // check that this is a literal
                        if (item instanceof Date) {
                            result = new Date(item);
                        }
                        else {
                            // it is an object literal
                            result = {};
                            for (var i in item) {
                                result[i] = me.clone(item[i]);
                            }
                        }
                    }
                    else {
                        if (false && item.constructor) {
                            result = new item.constructor();
                        }
                        else {
                            result = item;
                        }
                    }
                }
                else {
                    result = item;
                }
            }
            return result;
        };
        Object.defineProperty(FroalaEditorDirective.prototype, "froalaModel", {
            // froalaModel directive as input: store initial editor content
            set: function (content) {
                this.updateEditor(content);
            },
            enumerable: false,
            configurable: true
        });
        // Update editor with model contents.
        FroalaEditorDirective.prototype.updateEditor = function (content) {
            if (JSON.stringify(this._oldModel) == JSON.stringify(content)) {
                return;
            }
            if (!this._hasSpecialTag) {
                this._oldModel = content;
            }
            else {
                this._model = content;
            }
            if (this._editorInitialized) {
                if (!this._hasSpecialTag) {
                    this._editor.html.set(content);
                }
                else {
                    this.setContent();
                }
            }
            else {
                if (!this._hasSpecialTag) {
                    this._element.innerHTML = content || '';
                }
                else {
                    this.setContent();
                }
            }
        };
        // update model if editor contentChanged
        FroalaEditorDirective.prototype.updateModel = function () {
            var _this = this;
            this.zone.run(function () {
                var modelContent = null;
                if (_this._hasSpecialTag) {
                    var attributeNodes = _this._element.attributes;
                    var attrs = {};
                    for (var i = 0; i < attributeNodes.length; i++) {
                        var attrName = attributeNodes[i].name;
                        if (_this._opts.angularIgnoreAttrs && _this._opts.angularIgnoreAttrs.indexOf(attrName) != -1) {
                            continue;
                        }
                        attrs[attrName] = attributeNodes[i].value;
                    }
                    if (_this._element.innerHTML) {
                        attrs[_this.INNER_HTML_ATTR] = _this._element.innerHTML;
                    }
                    modelContent = attrs;
                }
                else {
                    var returnedHtml = _this._editor.html.get();
                    if (typeof returnedHtml === 'string') {
                        modelContent = returnedHtml;
                    }
                }
                if (_this._oldModel !== modelContent) {
                    _this._oldModel = modelContent;
                    // Update froalaModel.
                    _this.froalaModelChange.emit(modelContent);
                    // Update form model.
                    _this.onChange(modelContent);
                }
            });
        };
        FroalaEditorDirective.prototype.registerEvent = function (eventName, callback) {
            if (!eventName || !callback) {
                return;
            }
            if (!this._opts.events) {
                this._opts.events = {};
            }
            this._opts.events[eventName] = callback;
        };
        FroalaEditorDirective.prototype.initListeners = function () {
            var self = this;
            // Check if we have events on the editor.
            if (this._editor.events) {
                // bind contentChange and keyup event to froalaModel
                this._editor.events.on('contentChanged', function () {
                    self.updateModel();
                });
                this._editor.events.on('mousedown', function () {
                    setTimeout(function () {
                        self.onTouched();
                    }, 0);
                });
                if (this._opts.immediateAngularModelUpdate) {
                    this._editor.events.on('keyup', function () {
                        setTimeout(function () {
                            self.updateModel();
                        }, 0);
                    });
                }
            }
            this._editorInitialized = true;
        };
        FroalaEditorDirective.prototype.createEditor = function () {
            var _this = this;
            if (this._editorInitialized) {
                return;
            }
            this.setContent(true);
            // init editor
            this.zone.runOutsideAngular(function () {
                // Add listeners on initialized event.
                if (!_this._opts.events)
                    _this._opts.events = {};
                // Register initialized event.
                _this.registerEvent('initialized', _this._opts.events && _this._opts.events.initialized);
                var existingInitCallback = _this._opts.events.initialized;
                // Default initialized event.
                if (!_this._opts.events.initialized || !_this._opts.events.initialized.overridden) {
                    _this._opts.events.initialized = function () {
                        _this.initListeners();
                        existingInitCallback && existingInitCallback.call(_this._editor, _this);
                    };
                    _this._opts.events.initialized.overridden = true;
                }
                // Initialize the Froala Editor.
                _this._editor = new FroalaEditor(_this._element, _this._opts);
            });
        };
        FroalaEditorDirective.prototype.setHtml = function () {
            this._editor.html.set(this._model || "");
            // This will reset the undo stack everytime the model changes externally. Can we fix this?
            this._editor.undo.reset();
            this._editor.undo.saveStep();
        };
        FroalaEditorDirective.prototype.setContent = function (firstTime) {
            if (firstTime === void 0) { firstTime = false; }
            var self = this;
            // Set initial content
            if (this._model || this._model == '') {
                this._oldModel = this._model;
                if (this._hasSpecialTag) {
                    var tags = this._model;
                    // add tags on element
                    if (tags) {
                        for (var attr in tags) {
                            if (tags.hasOwnProperty(attr) && attr != this.INNER_HTML_ATTR) {
                                this._element.setAttribute(attr, tags[attr]);
                            }
                        }
                        if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
                            this._element.innerHTML = tags[this.INNER_HTML_ATTR];
                        }
                    }
                }
                else {
                    if (firstTime) {
                        this.registerEvent('initialized', function () {
                            self.setHtml();
                        });
                    }
                    else {
                        self.setHtml();
                    }
                }
            }
        };
        FroalaEditorDirective.prototype.destroyEditor = function () {
            if (this._editorInitialized) {
                this._editor.destroy();
                this._editorInitialized = false;
            }
        };
        FroalaEditorDirective.prototype.getEditor = function () {
            if (this._element) {
                return this._editor;
            }
            return null;
        };
        // send manual editor initialization
        FroalaEditorDirective.prototype.generateManualController = function () {
            var controls = {
                initialize: this.createEditor.bind(this),
                destroy: this.destroyEditor.bind(this),
                getEditor: this.getEditor.bind(this),
            };
            this.froalaInit.emit(controls);
        };
        // TODO not sure if ngOnInit is executed after @inputs
        FroalaEditorDirective.prototype.ngAfterViewInit = function () {
            // check if output froalaInit is present. Maybe observers is private and should not be used?? TODO how to better test that an output directive is present.
            if (!this.froalaInit.observers.length) {
                this.createEditor();
            }
            else {
                this.generateManualController();
            }
        };
        FroalaEditorDirective.prototype.ngOnDestroy = function () {
            this.destroyEditor();
        };
        FroalaEditorDirective.prototype.setDisabledState = function (isDisabled) {
        };
        return FroalaEditorDirective;
    }());
    FroalaEditorDirective.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[froalaEditor]',
                    exportAs: 'froalaEditor',
                    providers: [
                        {
                            provide: forms.NG_VALUE_ACCESSOR,
                            useExisting: i0.forwardRef(function () { return FroalaEditorDirective; }),
                            multi: true
                        }
                    ]
                },] }
    ];
    /** @nocollapse */
    FroalaEditorDirective.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i0.NgZone },
        { type: ScriptLoaderService }
    ]; };
    FroalaEditorDirective.propDecorators = {
        froalaEditor: [{ type: i0.Input }],
        froalaModel: [{ type: i0.Input }],
        froalaModelChange: [{ type: i0.Output }],
        froalaInit: [{ type: i0.Output }]
    };

    var FroalaEditorModule = /** @class */ (function () {
        function FroalaEditorModule() {
        }
        FroalaEditorModule.forRoot = function () {
            return { ngModule: FroalaEditorModule, providers: [] };
        };
        return FroalaEditorModule;
    }());
    FroalaEditorModule.decorators = [
        { type: i0.NgModule, args: [{
                    declarations: [FroalaEditorDirective],
                    exports: [FroalaEditorDirective]
                },] }
    ];

    var FroalaViewDirective = /** @class */ (function () {
        function FroalaViewDirective(renderer, element) {
            this.renderer = renderer;
            this._element = element.nativeElement;
        }
        Object.defineProperty(FroalaViewDirective.prototype, "froalaView", {
            // update content model as it comes
            set: function (content) {
                this._element.innerHTML = content;
            },
            enumerable: false,
            configurable: true
        });
        FroalaViewDirective.prototype.ngAfterViewInit = function () {
            this.renderer.addClass(this._element, "fr-view");
        };
        return FroalaViewDirective;
    }());
    FroalaViewDirective.decorators = [
        { type: i0.Directive, args: [{
                    selector: '[froalaView]'
                },] }
    ];
    /** @nocollapse */
    FroalaViewDirective.ctorParameters = function () { return [
        { type: i0.Renderer2 },
        { type: i0.ElementRef }
    ]; };
    FroalaViewDirective.propDecorators = {
        froalaView: [{ type: i0.Input }]
    };

    var FroalaViewModule = /** @class */ (function () {
        function FroalaViewModule() {
        }
        FroalaViewModule.forRoot = function () {
            return { ngModule: FroalaViewModule, providers: [] };
        };
        return FroalaViewModule;
    }());
    FroalaViewModule.decorators = [
        { type: i0.NgModule, args: [{
                    declarations: [FroalaViewDirective],
                    exports: [FroalaViewDirective]
                },] }
    ];

    var FERootModule = /** @class */ (function () {
        function FERootModule() {
        }
        return FERootModule;
    }());
    FERootModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        FroalaEditorModule.forRoot(),
                        FroalaViewModule.forRoot()
                    ],
                    exports: [
                        FroalaEditorModule,
                        FroalaViewModule
                    ]
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.FERootModule = FERootModule;
    exports.FroalaEditorDirective = FroalaEditorDirective;
    exports.FroalaEditorModule = FroalaEditorModule;
    exports.FroalaViewDirective = FroalaViewDirective;
    exports.FroalaViewModule = FroalaViewModule;
    exports.ɵa = ScriptLoaderService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-froala-wysiwyg.umd.js.map
