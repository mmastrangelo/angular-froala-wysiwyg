import { __awaiter } from "tslib";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Directive, ElementRef, EventEmitter, forwardRef, Input, NgZone, Output } from '@angular/core';
import { ScriptLoaderService } from "../loader/script-loader.service";
export class FroalaEditorDirective {
    constructor(el, zone, scriptLoader) {
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
        this.onChange = (_) => {
        };
        this.onTouched = () => {
        };
        // froalaModel directive as output: update model if editor contentChanged
        this.froalaModelChange = new EventEmitter();
        // froalaInit directive as output: send manual editor initialization
        this.froalaInit = new EventEmitter();
        let element = el.nativeElement;
        // check if the element is a special tag
        if (this.SPECIAL_TAGS.indexOf(element.tagName.toLowerCase()) != -1) {
            this._hasSpecialTag = true;
        }
        this._element = element;
        this.zone = zone;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scriptLoader.load("Froala", "../assets/froala_editor.pkgd.min.js");
        });
    }
    // Form model content changed.
    writeValue(content) {
        this.updateEditor(content);
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    // End ControlValueAccesor methods.
    // froalaEditor directive as input: store the editor options
    set froalaEditor(opts) {
        this._opts = this.clone(opts || this._opts);
        this._opts = Object.assign({}, this._opts);
    }
    // TODO: replace clone method with better possible alternate 
    clone(item) {
        const me = this;
        if (!item) {
            return item;
        } // null, undefined values check
        let types = [Number, String, Boolean], result;
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
    }
    // froalaModel directive as input: store initial editor content
    set froalaModel(content) {
        this.updateEditor(content);
    }
    // Update editor with model contents.
    updateEditor(content) {
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
    }
    // update model if editor contentChanged
    updateModel() {
        this.zone.run(() => {
            let modelContent = null;
            if (this._hasSpecialTag) {
                let attributeNodes = this._element.attributes;
                let attrs = {};
                for (let i = 0; i < attributeNodes.length; i++) {
                    let attrName = attributeNodes[i].name;
                    if (this._opts.angularIgnoreAttrs && this._opts.angularIgnoreAttrs.indexOf(attrName) != -1) {
                        continue;
                    }
                    attrs[attrName] = attributeNodes[i].value;
                }
                if (this._element.innerHTML) {
                    attrs[this.INNER_HTML_ATTR] = this._element.innerHTML;
                }
                modelContent = attrs;
            }
            else {
                let returnedHtml = this._editor.html.get();
                if (typeof returnedHtml === 'string') {
                    modelContent = returnedHtml;
                }
            }
            if (this._oldModel !== modelContent) {
                this._oldModel = modelContent;
                // Update froalaModel.
                this.froalaModelChange.emit(modelContent);
                // Update form model.
                this.onChange(modelContent);
            }
        });
    }
    registerEvent(eventName, callback) {
        if (!eventName || !callback) {
            return;
        }
        if (!this._opts.events) {
            this._opts.events = {};
        }
        this._opts.events[eventName] = callback;
    }
    initListeners() {
        let self = this;
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
    }
    createEditor() {
        if (this._editorInitialized) {
            return;
        }
        this.setContent(true);
        // init editor
        this.zone.runOutsideAngular(() => {
            // Add listeners on initialized event.
            if (!this._opts.events)
                this._opts.events = {};
            // Register initialized event.
            this.registerEvent('initialized', this._opts.events && this._opts.events.initialized);
            const existingInitCallback = this._opts.events.initialized;
            // Default initialized event.
            if (!this._opts.events.initialized || !this._opts.events.initialized.overridden) {
                this._opts.events.initialized = () => {
                    this.initListeners();
                    existingInitCallback && existingInitCallback.call(this._editor, this);
                };
                this._opts.events.initialized.overridden = true;
            }
            // Initialize the Froala Editor.
            this._editor = new FroalaEditor(this._element, this._opts);
        });
    }
    setHtml() {
        this._editor.html.set(this._model || "");
        // This will reset the undo stack everytime the model changes externally. Can we fix this?
        this._editor.undo.reset();
        this._editor.undo.saveStep();
    }
    setContent(firstTime = false) {
        let self = this;
        // Set initial content
        if (this._model || this._model == '') {
            this._oldModel = this._model;
            if (this._hasSpecialTag) {
                let tags = this._model;
                // add tags on element
                if (tags) {
                    for (let attr in tags) {
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
    }
    destroyEditor() {
        if (this._editorInitialized) {
            this._editor.destroy();
            this._editorInitialized = false;
        }
    }
    getEditor() {
        if (this._element) {
            return this._editor;
        }
        return null;
    }
    // send manual editor initialization
    generateManualController() {
        let controls = {
            initialize: this.createEditor.bind(this),
            destroy: this.destroyEditor.bind(this),
            getEditor: this.getEditor.bind(this),
        };
        this.froalaInit.emit(controls);
    }
    // TODO not sure if ngOnInit is executed after @inputs
    ngAfterViewInit() {
        // check if output froalaInit is present. Maybe observers is private and should not be used?? TODO how to better test that an output directive is present.
        if (!this.froalaInit.observers.length) {
            this.createEditor();
        }
        else {
            this.generateManualController();
        }
    }
    ngOnDestroy() {
        this.destroyEditor();
    }
    setDisabledState(isDisabled) {
    }
}
FroalaEditorDirective.decorators = [
    { type: Directive, args: [{
                selector: '[froalaEditor]',
                exportAs: 'froalaEditor',
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => FroalaEditorDirective),
                        multi: true
                    }
                ]
            },] }
];
/** @nocollapse */
FroalaEditorDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: ScriptLoaderService }
];
FroalaEditorDirective.propDecorators = {
    froalaEditor: [{ type: Input }],
    froalaModel: [{ type: Input }],
    froalaModelChange: [{ type: Output }],
    froalaInit: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2VkaXRvci9lZGl0b3IuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQXdCLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQWlCdEUsTUFBTSxPQUFPLHFCQUFxQjtJQXdCaEMsWUFBWSxFQUFjLEVBQVUsSUFBWSxFQUFVLFlBQWlDO1FBQXZELFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUF0QjNGLGlCQUFpQjtRQUNULFVBQUssR0FBUTtZQUNuQiwyQkFBMkIsRUFBRSxLQUFLO1lBQ2xDLGtCQUFrQixFQUFFLElBQUk7U0FDekIsQ0FBQztRQUlNLGlCQUFZLEdBQWEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RCxvQkFBZSxHQUFXLFdBQVcsQ0FBQztRQUN0QyxtQkFBYyxHQUFZLEtBQUssQ0FBQztRQVFoQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFFcEMsY0FBUyxHQUFXLElBQUksQ0FBQztRQW1CakMscUNBQXFDO1FBQ3JDLGFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ2pCLENBQUMsQ0FBQztRQUNGLGNBQVMsR0FBRyxHQUFHLEVBQUU7UUFDakIsQ0FBQyxDQUFDO1FBdUdGLHlFQUF5RTtRQUMvRCxzQkFBaUIsR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUV6RSxvRUFBb0U7UUFDMUQsZUFB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LEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3RDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDckMsQ0FBQztRQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsZUFBZTtRQUNiLDBKQUEwSjtRQUMxSixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNyQjthQUFNO1lBQ0wsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7U0FDakM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsVUFBbUI7SUFDcEMsQ0FBQzs7O1lBNVdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsY0FBYztnQkFDeEIsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxpQkFBaUI7d0JBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUM7d0JBQ3BELEtBQUssRUFBRSxJQUFJO3FCQUNaO2lCQUNGO2FBQ0Y7Ozs7WUFqQm1CLFVBQVU7WUFBbUMsTUFBTTtZQUM5RCxtQkFBbUI7OzsyQkFnRnpCLEtBQUs7MEJBc0RMLEtBQUs7Z0NBZ0NMLE1BQU07eUJBR04sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIGZvcndhcmRSZWYsIElucHV0LCBOZ1pvbmUsIE9uSW5pdCwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTY3JpcHRMb2FkZXJTZXJ2aWNlIH0gZnJvbSBcIi4uL2xvYWRlci9zY3JpcHQtbG9hZGVyLnNlcnZpY2VcIjtcblxuLy8gaW1wb3J0IEZyb2FsYUVkaXRvciBmcm9tICdmcm9hbGEtZWRpdG9yJztcblxuZGVjbGFyZSBsZXQgRnJvYWxhRWRpdG9yO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbZnJvYWxhRWRpdG9yXScsXG4gIGV4cG9ydEFzOiAnZnJvYWxhRWRpdG9yJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBGcm9hbGFFZGl0b3JEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWVcbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgRnJvYWxhRWRpdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCB7XG5cbiAgLy8gZWRpdG9yIG9wdGlvbnNcbiAgcHJpdmF0ZSBfb3B0czogYW55ID0ge1xuICAgIGltbWVkaWF0ZUFuZ3VsYXJNb2RlbFVwZGF0ZTogZmFsc2UsXG4gICAgYW5ndWxhcklnbm9yZUF0dHJzOiBudWxsXG4gIH07XG5cbiAgcHJpdmF0ZSBfZWxlbWVudDogYW55O1xuXG4gIHByaXZhdGUgU1BFQ0lBTF9UQUdTOiBzdHJpbmdbXSA9IFsnaW1nJywgJ2J1dHRvbicsICdpbnB1dCcsICdhJ107XG4gIHByaXZhdGUgSU5ORVJfSFRNTF9BVFRSOiBzdHJpbmcgPSAnaW5uZXJIVE1MJztcbiAgcHJpdmF0ZSBfaGFzU3BlY2lhbFRhZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVkaXRvciBlbGVtZW50XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuXG4gIC8vIGluaXRpYWwgZWRpdG9yIGNvbnRlbnRcbiAgcHJpdmF0ZSBfbW9kZWw6IHN0cmluZztcblxuICBwcml2YXRlIF9lZGl0b3JJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX29sZE1vZGVsOiBzdHJpbmcgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBzY3JpcHRMb2FkZXI6IFNjcmlwdExvYWRlclNlcnZpY2UpIHtcblxuICAgIGxldCBlbGVtZW50OiBhbnkgPSBlbC5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gY2hlY2sgaWYgdGhlIGVsZW1lbnQgaXMgYSBzcGVjaWFsIHRhZ1xuICAgIGlmICh0aGlzLlNQRUNJQUxfVEFHUy5pbmRleE9mKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSAhPSAtMSkge1xuICAgICAgdGhpcy5faGFzU3BlY2lhbFRhZyA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy56b25lID0gem9uZTtcbiAgfVxuXG4gIGFzeW5jIG5nT25Jbml0KCkge1xuICAgIGF3YWl0IHRoaXMuc2NyaXB0TG9hZGVyLmxvYWQoXCJGcm9hbGFcIiwgXCIuLi9hc3NldHMvZnJvYWxhX2VkaXRvci5wa2dkLm1pbi5qc1wiKTtcbiAgfVxuXG4gIC8vIEJlZ2luIENvbnRyb2xWYWx1ZUFjY2Vzb3IgbWV0aG9kcy5cbiAgb25DaGFuZ2UgPSAoXykgPT4ge1xuICB9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7XG4gIH07XG5cbiAgLy8gRm9ybSBtb2RlbCBjb250ZW50IGNoYW5nZWQuXG4gIHdyaXRlVmFsdWUoY29udGVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVFZGl0b3IoY29udGVudCk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoXzogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLy8gRW5kIENvbnRyb2xWYWx1ZUFjY2Vzb3IgbWV0aG9kcy5cblxuICAvLyBmcm9hbGFFZGl0b3IgZGlyZWN0aXZlIGFzIGlucHV0OiBzdG9yZSB0aGUgZWRpdG9yIG9wdGlvbnNcbiAgQElucHV0KCkgc2V0IGZyb2FsYUVkaXRvcihvcHRzOiBhbnkpIHtcbiAgICB0aGlzLl9vcHRzID0gdGhpcy5jbG9uZSggIG9wdHMgfHwgdGhpcy5fb3B0cyk7XG4gICAgdGhpcy5fb3B0cyA9ICB7Li4udGhpcy5fb3B0c307XG4gIH1cblxuICAgLy8gVE9ETzogcmVwbGFjZSBjbG9uZSBtZXRob2Qgd2l0aCBiZXR0ZXIgcG9zc2libGUgYWx0ZXJuYXRlIFxuICBwcml2YXRlIGNsb25lKGl0ZW0pIHtcbiAgXHRjb25zdCBtZSA9IHRoaXM7ICBcbiAgICAgIGlmICghaXRlbSkgeyByZXR1cm4gaXRlbTsgfSAvLyBudWxsLCB1bmRlZmluZWQgdmFsdWVzIGNoZWNrXG5cbiAgICAgIGxldCB0eXBlcyA9IFsgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gXSwgXG4gICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAvLyBub3JtYWxpemluZyBwcmltaXRpdmVzIGlmIHNvbWVvbmUgZGlkIG5ldyBTdHJpbmcoJ2FhYScpLCBvciBuZXcgTnVtYmVyKCc0NDQnKTtcbiAgICAgIHR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlKCBpdGVtICk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCBpdGVtICkgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgaXRlbS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkLCBpbmRleCwgYXJyYXkpIHsgXG4gICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gbWUuY2xvbmUoIGNoaWxkICk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0gPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAvLyB0ZXN0aW5nIHRoYXQgdGhpcyBpcyBET01cbiAgICAgICAgICAgICAgaWYgKGl0ZW0ubm9kZVR5cGUgJiYgdHlwZW9mIGl0ZW0uY2xvbmVOb2RlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlbS5jbG9uZU5vZGUoIHRydWUgKTsgICAgXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWl0ZW0ucHJvdG90eXBlKSB7IC8vIGNoZWNrIHRoYXQgdGhpcyBpcyBhIGxpdGVyYWxcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBEYXRlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBpcyBhbiBvYmplY3QgbGl0ZXJhbFxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSBtZS5jbG9uZSggaXRlbVtpXSApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChmYWxzZSAmJiBpdGVtLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IGl0ZW0uY29uc3RydWN0b3IoKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvLyBmcm9hbGFNb2RlbCBkaXJlY3RpdmUgYXMgaW5wdXQ6IHN0b3JlIGluaXRpYWwgZWRpdG9yIGNvbnRlbnRcbiAgQElucHV0KCkgc2V0IGZyb2FsYU1vZGVsKGNvbnRlbnQ6IGFueSkge1xuICAgIHRoaXMudXBkYXRlRWRpdG9yKGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gVXBkYXRlIGVkaXRvciB3aXRoIG1vZGVsIGNvbnRlbnRzLlxuICBwcml2YXRlIHVwZGF0ZUVkaXRvcihjb250ZW50OiBhbnkpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5fb2xkTW9kZWwpID09IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG4gICAgICB0aGlzLl9vbGRNb2RlbCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21vZGVsID0gY29udGVudDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICghdGhpcy5faGFzU3BlY2lhbFRhZykge1xuICAgICAgICB0aGlzLl9lZGl0b3IuaHRtbC5zZXQoY29udGVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldENvbnRlbnQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudCB8fCAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0Q29udGVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGZyb2FsYU1vZGVsIGRpcmVjdGl2ZSBhcyBvdXRwdXQ6IHVwZGF0ZSBtb2RlbCBpZiBlZGl0b3IgY29udGVudENoYW5nZWRcbiAgQE91dHB1dCgpIGZyb2FsYU1vZGVsQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIC8vIGZyb2FsYUluaXQgZGlyZWN0aXZlIGFzIG91dHB1dDogc2VuZCBtYW51YWwgZWRpdG9yIGluaXRpYWxpemF0aW9uXG4gIEBPdXRwdXQoKSBmcm9hbGFJbml0OiBFdmVudEVtaXR0ZXI8T2JqZWN0PiA9IG5ldyBFdmVudEVtaXR0ZXI8T2JqZWN0PigpO1xuXG4gIC8vIHVwZGF0ZSBtb2RlbCBpZiBlZGl0b3IgY29udGVudENoYW5nZWRcbiAgcHJpdmF0ZSB1cGRhdGVNb2RlbCgpIHtcbiAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcblxuICAgICAgbGV0IG1vZGVsQ29udGVudDogYW55ID0gbnVsbDtcblxuICAgICAgaWYgKHRoaXMuX2hhc1NwZWNpYWxUYWcpIHtcblxuICAgICAgICBsZXQgYXR0cmlidXRlTm9kZXMgPSB0aGlzLl9lbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgIGxldCBhdHRycyA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlTm9kZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgIGxldCBhdHRyTmFtZSA9IGF0dHJpYnV0ZU5vZGVzW2ldLm5hbWU7XG4gICAgICAgICAgaWYgKHRoaXMuX29wdHMuYW5ndWxhcklnbm9yZUF0dHJzICYmIHRoaXMuX29wdHMuYW5ndWxhcklnbm9yZUF0dHJzLmluZGV4T2YoYXR0ck5hbWUpICE9IC0xKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhdHRyc1thdHRyTmFtZV0gPSBhdHRyaWJ1dGVOb2Rlc1tpXS52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50LmlubmVySFRNTCkge1xuICAgICAgICAgIGF0dHJzW3RoaXMuSU5ORVJfSFRNTF9BVFRSXSA9IHRoaXMuX2VsZW1lbnQuaW5uZXJIVE1MO1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kZWxDb250ZW50ID0gYXR0cnM7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGxldCByZXR1cm5lZEh0bWw6IGFueSA9IHRoaXMuX2VkaXRvci5odG1sLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIHJldHVybmVkSHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBtb2RlbENvbnRlbnQgPSByZXR1cm5lZEh0bWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9vbGRNb2RlbCAhPT0gbW9kZWxDb250ZW50KSB7XG4gICAgICAgIHRoaXMuX29sZE1vZGVsID0gbW9kZWxDb250ZW50O1xuXG4gICAgICAgIC8vIFVwZGF0ZSBmcm9hbGFNb2RlbC5cbiAgICAgICAgdGhpcy5mcm9hbGFNb2RlbENoYW5nZS5lbWl0KG1vZGVsQ29udGVudCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGZvcm0gbW9kZWwuXG4gICAgICAgIHRoaXMub25DaGFuZ2UobW9kZWxDb250ZW50KTtcbiAgICAgIH1cblxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyRXZlbnQoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICghZXZlbnROYW1lIHx8ICFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fb3B0cy5ldmVudHMpIHtcbiAgICAgIHRoaXMuX29wdHMuZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5fb3B0cy5ldmVudHNbZXZlbnROYW1lXSA9IGNhbGxiYWNrO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0TGlzdGVuZXJzKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGV2ZW50cyBvbiB0aGUgZWRpdG9yLlxuICAgIGlmICh0aGlzLl9lZGl0b3IuZXZlbnRzKSB7XG4gICAgICAvLyBiaW5kIGNvbnRlbnRDaGFuZ2UgYW5kIGtleXVwIGV2ZW50IHRvIGZyb2FsYU1vZGVsXG4gICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdjb250ZW50Q2hhbmdlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi51cGRhdGVNb2RlbCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYub25Ub3VjaGVkKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLl9vcHRzLmltbWVkaWF0ZUFuZ3VsYXJNb2RlbFVwZGF0ZSkge1xuICAgICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYudXBkYXRlTW9kZWwoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRvckluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRDb250ZW50KHRydWUpO1xuXG4gICAgLy8gaW5pdCBlZGl0b3JcbiAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgLy8gQWRkIGxpc3RlbmVycyBvbiBpbml0aWFsaXplZCBldmVudC5cbiAgICAgIGlmICghdGhpcy5fb3B0cy5ldmVudHMpIHRoaXMuX29wdHMuZXZlbnRzID0ge307XG5cbiAgICAgIC8vIFJlZ2lzdGVyIGluaXRpYWxpemVkIGV2ZW50LlxuICAgICAgdGhpcy5yZWdpc3RlckV2ZW50KCdpbml0aWFsaXplZCcsIHRoaXMuX29wdHMuZXZlbnRzICYmIHRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nSW5pdENhbGxiYWNrID0gdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQ7XG4gICAgICAvLyBEZWZhdWx0IGluaXRpYWxpemVkIGV2ZW50LlxuICAgICAgaWYgKCF0aGlzLl9vcHRzLmV2ZW50cy5pbml0aWFsaXplZCB8fCAhdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQub3ZlcnJpZGRlbikge1xuICAgICAgICB0aGlzLl9vcHRzLmV2ZW50cy5pbml0aWFsaXplZCA9ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmluaXRMaXN0ZW5lcnMoKTtcbiAgICAgICAgICBleGlzdGluZ0luaXRDYWxsYmFjayAmJiBleGlzdGluZ0luaXRDYWxsYmFjay5jYWxsKHRoaXMuX2VkaXRvciwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkLm92ZXJyaWRkZW4gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBGcm9hbGEgRWRpdG9yLlxuICAgICAgdGhpcy5fZWRpdG9yID0gbmV3IEZyb2FsYUVkaXRvcihcbiAgICAgICAgdGhpcy5fZWxlbWVudCxcbiAgICAgICAgdGhpcy5fb3B0c1xuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SHRtbCgpIHtcbiAgICB0aGlzLl9lZGl0b3IuaHRtbC5zZXQodGhpcy5fbW9kZWwgfHwgXCJcIik7XG5cbiAgICAvLyBUaGlzIHdpbGwgcmVzZXQgdGhlIHVuZG8gc3RhY2sgZXZlcnl0aW1lIHRoZSBtb2RlbCBjaGFuZ2VzIGV4dGVybmFsbHkuIENhbiB3ZSBmaXggdGhpcz9cbiAgICB0aGlzLl9lZGl0b3IudW5kby5yZXNldCgpO1xuICAgIHRoaXMuX2VkaXRvci51bmRvLnNhdmVTdGVwKCk7XG4gIH1cblxuICBwcml2YXRlIHNldENvbnRlbnQoZmlyc3RUaW1lID0gZmFsc2UpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTZXQgaW5pdGlhbCBjb250ZW50XG4gICAgaWYgKHRoaXMuX21vZGVsIHx8IHRoaXMuX21vZGVsID09ICcnKSB7XG4gICAgICB0aGlzLl9vbGRNb2RlbCA9IHRoaXMuX21vZGVsO1xuICAgICAgaWYgKHRoaXMuX2hhc1NwZWNpYWxUYWcpIHtcblxuICAgICAgICBsZXQgdGFnczogT2JqZWN0ID0gdGhpcy5fbW9kZWw7XG5cbiAgICAgICAgLy8gYWRkIHRhZ3Mgb24gZWxlbWVudFxuICAgICAgICBpZiAodGFncykge1xuXG4gICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiB0YWdzKSB7XG4gICAgICAgICAgICBpZiAodGFncy5oYXNPd25Qcm9wZXJ0eShhdHRyKSAmJiBhdHRyICE9IHRoaXMuSU5ORVJfSFRNTF9BVFRSKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsIHRhZ3NbYXR0cl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0YWdzLmhhc093blByb3BlcnR5KHRoaXMuSU5ORVJfSFRNTF9BVFRSKSkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5pbm5lckhUTUwgPSB0YWdzW3RoaXMuSU5ORVJfSFRNTF9BVFRSXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaXJzdFRpbWUpIHtcbiAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoJ2luaXRpYWxpemVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXRIdG1sKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5zZXRIdG1sKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRvckluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEVkaXRvcigpIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHNlbmQgbWFudWFsIGVkaXRvciBpbml0aWFsaXphdGlvblxuICBwcml2YXRlIGdlbmVyYXRlTWFudWFsQ29udHJvbGxlcigpIHtcbiAgICBsZXQgY29udHJvbHMgPSB7XG4gICAgICBpbml0aWFsaXplOiB0aGlzLmNyZWF0ZUVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgZGVzdHJveTogdGhpcy5kZXN0cm95RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICBnZXRFZGl0b3I6IHRoaXMuZ2V0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLmZyb2FsYUluaXQuZW1pdChjb250cm9scyk7XG4gIH1cblxuICAvLyBUT0RPIG5vdCBzdXJlIGlmIG5nT25Jbml0IGlzIGV4ZWN1dGVkIGFmdGVyIEBpbnB1dHNcbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIC8vIGNoZWNrIGlmIG91dHB1dCBmcm9hbGFJbml0IGlzIHByZXNlbnQuIE1heWJlIG9ic2VydmVycyBpcyBwcml2YXRlIGFuZCBzaG91bGQgbm90IGJlIHVzZWQ/PyBUT0RPIGhvdyB0byBiZXR0ZXIgdGVzdCB0aGF0IGFuIG91dHB1dCBkaXJlY3RpdmUgaXMgcHJlc2VudC5cbiAgICBpZiAoIXRoaXMuZnJvYWxhSW5pdC5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNyZWF0ZUVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdlbmVyYXRlTWFudWFsQ29udHJvbGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveUVkaXRvcigpO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gIH1cbn1cbiJdfQ==