(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/forms'), require('@angular/core'), require('@angular/common/http'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular-froala-wysiwyg', ['exports', '@angular/forms', '@angular/core', '@angular/common/http', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['angular-froala-wysiwyg'] = {}, global.ng.forms, global.ng.core, global.ng.common.http, global.rxjs, global.rxjs.operators));
}(this, (function (exports, forms, i0, i1, rxjs, operators) { 'use strict';

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
            this.scriptLoader.load("Froala", this._opts.froalaJsPath)
                .toPromise()
                .then(function () {
                _this.setContent(true);
                // init editor
                _this.zone.runOutsideAngular(function () {
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
