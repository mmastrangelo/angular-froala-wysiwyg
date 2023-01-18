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
        this.scriptLoader.load("Froala", this._opts.froalaJsPath)
            .toPromise()
            .then(() => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2VkaXRvci9lZGl0b3IuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQVUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9HLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBaUJ0RSxNQUFNLE9BQU8scUJBQXFCO0lBd0JoQyxZQUFZLEVBQWMsRUFBVSxJQUFZLEVBQVUsWUFBaUM7UUFBdkQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQXRCM0YsaUJBQWlCO1FBQ1QsVUFBSyxHQUFRO1lBQ25CLDJCQUEyQixFQUFFLEtBQUs7WUFDbEMsa0JBQWtCLEVBQUUsSUFBSTtTQUN6QixDQUFDO1FBSU0saUJBQVksR0FBYSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELG9CQUFlLEdBQVcsV0FBVyxDQUFDO1FBQ3RDLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBUWhDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUVwQyxjQUFTLEdBQVcsSUFBSSxDQUFDO1FBZWpDLHFDQUFxQztRQUNyQyxhQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNqQixDQUFDLENBQUM7UUFDRixjQUFTLEdBQUcsR0FBRyxFQUFFO1FBQ2pCLENBQUMsQ0FBQztRQXVHRix5RUFBeUU7UUFDL0Qsc0JBQWlCLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFFekUsb0VBQW9FO1FBQzFELGVBQVUs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SUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdEMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNyQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELHNEQUFzRDtJQUN0RCxlQUFlO1FBQ2IsMEpBQTBKO1FBQzFKLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDckMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDTCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxVQUFtQjtJQUNwQyxDQUFDOzs7WUE1V0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLGlCQUFpQjt3QkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDcEQsS0FBSyxFQUFFLElBQUk7cUJBQ1o7aUJBQ0Y7YUFDRjs7OztZQWpCbUIsVUFBVTtZQUFtQyxNQUFNO1lBQzlELG1CQUFtQjs7OzJCQTRFekIsS0FBSzswQkFzREwsS0FBSztnQ0FnQ0wsTUFBTTt5QkFHTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgZm9yd2FyZFJlZiwgSW5wdXQsIE5nWm9uZSwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNjcmlwdExvYWRlclNlcnZpY2UgfSBmcm9tIFwiLi4vbG9hZGVyL3NjcmlwdC1sb2FkZXIuc2VydmljZVwiO1xuXG4vLyBpbXBvcnQgRnJvYWxhRWRpdG9yIGZyb20gJ2Zyb2FsYS1lZGl0b3InO1xuXG5kZWNsYXJlIGxldCBGcm9hbGFFZGl0b3I7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tmcm9hbGFFZGl0b3JdJyxcbiAgZXhwb3J0QXM6ICdmcm9hbGFFZGl0b3InLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEZyb2FsYUVkaXRvckRpcmVjdGl2ZSksXG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBGcm9hbGFFZGl0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG5cbiAgLy8gZWRpdG9yIG9wdGlvbnNcbiAgcHJpdmF0ZSBfb3B0czogYW55ID0ge1xuICAgIGltbWVkaWF0ZUFuZ3VsYXJNb2RlbFVwZGF0ZTogZmFsc2UsXG4gICAgYW5ndWxhcklnbm9yZUF0dHJzOiBudWxsXG4gIH07XG5cbiAgcHJpdmF0ZSBfZWxlbWVudDogYW55O1xuXG4gIHByaXZhdGUgU1BFQ0lBTF9UQUdTOiBzdHJpbmdbXSA9IFsnaW1nJywgJ2J1dHRvbicsICdpbnB1dCcsICdhJ107XG4gIHByaXZhdGUgSU5ORVJfSFRNTF9BVFRSOiBzdHJpbmcgPSAnaW5uZXJIVE1MJztcbiAgcHJpdmF0ZSBfaGFzU3BlY2lhbFRhZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVkaXRvciBlbGVtZW50XG4gIHByaXZhdGUgX2VkaXRvcjogYW55O1xuXG4gIC8vIGluaXRpYWwgZWRpdG9yIGNvbnRlbnRcbiAgcHJpdmF0ZSBfbW9kZWw6IHN0cmluZztcblxuICBwcml2YXRlIF9lZGl0b3JJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX29sZE1vZGVsOiBzdHJpbmcgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBzY3JpcHRMb2FkZXI6IFNjcmlwdExvYWRlclNlcnZpY2UpIHtcblxuICAgIGxldCBlbGVtZW50OiBhbnkgPSBlbC5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gY2hlY2sgaWYgdGhlIGVsZW1lbnQgaXMgYSBzcGVjaWFsIHRhZ1xuICAgIGlmICh0aGlzLlNQRUNJQUxfVEFHUy5pbmRleE9mKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSAhPSAtMSkge1xuICAgICAgdGhpcy5faGFzU3BlY2lhbFRhZyA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy56b25lID0gem9uZTtcbiAgfVxuXG4gIC8vIEJlZ2luIENvbnRyb2xWYWx1ZUFjY2Vzb3IgbWV0aG9kcy5cbiAgb25DaGFuZ2UgPSAoXykgPT4ge1xuICB9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7XG4gIH07XG5cbiAgLy8gRm9ybSBtb2RlbCBjb250ZW50IGNoYW5nZWQuXG4gIHdyaXRlVmFsdWUoY29udGVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVFZGl0b3IoY29udGVudCk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoXzogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLy8gRW5kIENvbnRyb2xWYWx1ZUFjY2Vzb3IgbWV0aG9kcy5cblxuICAvLyBmcm9hbGFFZGl0b3IgZGlyZWN0aXZlIGFzIGlucHV0OiBzdG9yZSB0aGUgZWRpdG9yIG9wdGlvbnNcbiAgQElucHV0KCkgc2V0IGZyb2FsYUVkaXRvcihvcHRzOiBhbnkpIHtcbiAgICB0aGlzLl9vcHRzID0gdGhpcy5jbG9uZSggIG9wdHMgfHwgdGhpcy5fb3B0cyk7XG4gICAgdGhpcy5fb3B0cyA9ICB7Li4udGhpcy5fb3B0c307XG4gIH1cblxuICAgLy8gVE9ETzogcmVwbGFjZSBjbG9uZSBtZXRob2Qgd2l0aCBiZXR0ZXIgcG9zc2libGUgYWx0ZXJuYXRlIFxuICBwcml2YXRlIGNsb25lKGl0ZW0pIHtcbiAgXHRjb25zdCBtZSA9IHRoaXM7ICBcbiAgICAgIGlmICghaXRlbSkgeyByZXR1cm4gaXRlbTsgfSAvLyBudWxsLCB1bmRlZmluZWQgdmFsdWVzIGNoZWNrXG5cbiAgICAgIGxldCB0eXBlcyA9IFsgTnVtYmVyLCBTdHJpbmcsIEJvb2xlYW4gXSwgXG4gICAgICAgICAgcmVzdWx0O1xuXG4gICAgICAvLyBub3JtYWxpemluZyBwcmltaXRpdmVzIGlmIHNvbWVvbmUgZGlkIG5ldyBTdHJpbmcoJ2FhYScpLCBvciBuZXcgTnVtYmVyKCc0NDQnKTtcbiAgICAgIHR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlKCBpdGVtICk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCBpdGVtICkgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgaXRlbS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkLCBpbmRleCwgYXJyYXkpIHsgXG4gICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gbWUuY2xvbmUoIGNoaWxkICk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0gPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAvLyB0ZXN0aW5nIHRoYXQgdGhpcyBpcyBET01cbiAgICAgICAgICAgICAgaWYgKGl0ZW0ubm9kZVR5cGUgJiYgdHlwZW9mIGl0ZW0uY2xvbmVOb2RlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlbS5jbG9uZU5vZGUoIHRydWUgKTsgICAgXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWl0ZW0ucHJvdG90eXBlKSB7IC8vIGNoZWNrIHRoYXQgdGhpcyBpcyBhIGxpdGVyYWxcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBEYXRlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBpcyBhbiBvYmplY3QgbGl0ZXJhbFxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSBtZS5jbG9uZSggaXRlbVtpXSApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChmYWxzZSAmJiBpdGVtLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IGl0ZW0uY29uc3RydWN0b3IoKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvLyBmcm9hbGFNb2RlbCBkaXJlY3RpdmUgYXMgaW5wdXQ6IHN0b3JlIGluaXRpYWwgZWRpdG9yIGNvbnRlbnRcbiAgQElucHV0KCkgc2V0IGZyb2FsYU1vZGVsKGNvbnRlbnQ6IGFueSkge1xuICAgIHRoaXMudXBkYXRlRWRpdG9yKGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gVXBkYXRlIGVkaXRvciB3aXRoIG1vZGVsIGNvbnRlbnRzLlxuICBwcml2YXRlIHVwZGF0ZUVkaXRvcihjb250ZW50OiBhbnkpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5fb2xkTW9kZWwpID09IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG4gICAgICB0aGlzLl9vbGRNb2RlbCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21vZGVsID0gY29udGVudDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQpIHtcbiAgICAgIGlmICghdGhpcy5faGFzU3BlY2lhbFRhZykge1xuICAgICAgICB0aGlzLl9lZGl0b3IuaHRtbC5zZXQoY29udGVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldENvbnRlbnQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLl9oYXNTcGVjaWFsVGFnKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudCB8fCAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0Q29udGVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGZyb2FsYU1vZGVsIGRpcmVjdGl2ZSBhcyBvdXRwdXQ6IHVwZGF0ZSBtb2RlbCBpZiBlZGl0b3IgY29udGVudENoYW5nZWRcbiAgQE91dHB1dCgpIGZyb2FsYU1vZGVsQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIC8vIGZyb2FsYUluaXQgZGlyZWN0aXZlIGFzIG91dHB1dDogc2VuZCBtYW51YWwgZWRpdG9yIGluaXRpYWxpemF0aW9uXG4gIEBPdXRwdXQoKSBmcm9hbGFJbml0OiBFdmVudEVtaXR0ZXI8T2JqZWN0PiA9IG5ldyBFdmVudEVtaXR0ZXI8T2JqZWN0PigpO1xuXG4gIC8vIHVwZGF0ZSBtb2RlbCBpZiBlZGl0b3IgY29udGVudENoYW5nZWRcbiAgcHJpdmF0ZSB1cGRhdGVNb2RlbCgpIHtcbiAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcblxuICAgICAgbGV0IG1vZGVsQ29udGVudDogYW55ID0gbnVsbDtcblxuICAgICAgaWYgKHRoaXMuX2hhc1NwZWNpYWxUYWcpIHtcblxuICAgICAgICBsZXQgYXR0cmlidXRlTm9kZXMgPSB0aGlzLl9lbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgIGxldCBhdHRycyA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlTm9kZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgIGxldCBhdHRyTmFtZSA9IGF0dHJpYnV0ZU5vZGVzW2ldLm5hbWU7XG4gICAgICAgICAgaWYgKHRoaXMuX29wdHMuYW5ndWxhcklnbm9yZUF0dHJzICYmIHRoaXMuX29wdHMuYW5ndWxhcklnbm9yZUF0dHJzLmluZGV4T2YoYXR0ck5hbWUpICE9IC0xKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhdHRyc1thdHRyTmFtZV0gPSBhdHRyaWJ1dGVOb2Rlc1tpXS52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50LmlubmVySFRNTCkge1xuICAgICAgICAgIGF0dHJzW3RoaXMuSU5ORVJfSFRNTF9BVFRSXSA9IHRoaXMuX2VsZW1lbnQuaW5uZXJIVE1MO1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kZWxDb250ZW50ID0gYXR0cnM7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGxldCByZXR1cm5lZEh0bWw6IGFueSA9IHRoaXMuX2VkaXRvci5odG1sLmdldCgpO1xuICAgICAgICBpZiAodHlwZW9mIHJldHVybmVkSHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBtb2RlbENvbnRlbnQgPSByZXR1cm5lZEh0bWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9vbGRNb2RlbCAhPT0gbW9kZWxDb250ZW50KSB7XG4gICAgICAgIHRoaXMuX29sZE1vZGVsID0gbW9kZWxDb250ZW50O1xuXG4gICAgICAgIC8vIFVwZGF0ZSBmcm9hbGFNb2RlbC5cbiAgICAgICAgdGhpcy5mcm9hbGFNb2RlbENoYW5nZS5lbWl0KG1vZGVsQ29udGVudCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGZvcm0gbW9kZWwuXG4gICAgICAgIHRoaXMub25DaGFuZ2UobW9kZWxDb250ZW50KTtcbiAgICAgIH1cblxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyRXZlbnQoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICghZXZlbnROYW1lIHx8ICFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fb3B0cy5ldmVudHMpIHtcbiAgICAgIHRoaXMuX29wdHMuZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5fb3B0cy5ldmVudHNbZXZlbnROYW1lXSA9IGNhbGxiYWNrO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0TGlzdGVuZXJzKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGV2ZW50cyBvbiB0aGUgZWRpdG9yLlxuICAgIGlmICh0aGlzLl9lZGl0b3IuZXZlbnRzKSB7XG4gICAgICAvLyBiaW5kIGNvbnRlbnRDaGFuZ2UgYW5kIGtleXVwIGV2ZW50IHRvIGZyb2FsYU1vZGVsXG4gICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdjb250ZW50Q2hhbmdlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi51cGRhdGVNb2RlbCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYub25Ub3VjaGVkKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLl9vcHRzLmltbWVkaWF0ZUFuZ3VsYXJNb2RlbFVwZGF0ZSkge1xuICAgICAgICB0aGlzLl9lZGl0b3IuZXZlbnRzLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYudXBkYXRlTW9kZWwoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRvckluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zY3JpcHRMb2FkZXIubG9hZChcIkZyb2FsYVwiLCB0aGlzLl9vcHRzLmZyb2FsYUpzUGF0aClcbiAgICAgIC50b1Byb21pc2UoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNldENvbnRlbnQodHJ1ZSk7XG5cbiAgICAgICAgLy8gaW5pdCBlZGl0b3JcbiAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAvLyBBZGQgbGlzdGVuZXJzIG9uIGluaXRpYWxpemVkIGV2ZW50LlxuICAgICAgICAgIGlmICghdGhpcy5fb3B0cy5ldmVudHMpIHRoaXMuX29wdHMuZXZlbnRzID0ge307XG4gICAgXG4gICAgICAgICAgLy8gUmVnaXN0ZXIgaW5pdGlhbGl6ZWQgZXZlbnQuXG4gICAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50KCdpbml0aWFsaXplZCcsIHRoaXMuX29wdHMuZXZlbnRzICYmIHRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkKTtcbiAgICAgICAgICBjb25zdCBleGlzdGluZ0luaXRDYWxsYmFjayA9IHRoaXMuX29wdHMuZXZlbnRzLmluaXRpYWxpemVkO1xuICAgICAgICAgIC8vIERlZmF1bHQgaW5pdGlhbGl6ZWQgZXZlbnQuXG4gICAgICAgICAgaWYgKCF0aGlzLl9vcHRzLmV2ZW50cy5pbml0aWFsaXplZCB8fCAhdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQub3ZlcnJpZGRlbikge1xuICAgICAgICAgICAgdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuaW5pdExpc3RlbmVycygpO1xuICAgICAgICAgICAgICBleGlzdGluZ0luaXRDYWxsYmFjayAmJiBleGlzdGluZ0luaXRDYWxsYmFjay5jYWxsKHRoaXMuX2VkaXRvciwgdGhpcyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fb3B0cy5ldmVudHMuaW5pdGlhbGl6ZWQub3ZlcnJpZGRlbiA9IHRydWU7XG4gICAgICAgICAgfVxuICAgIFxuICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIEZyb2FsYSBFZGl0b3IuXG4gICAgICAgICAgdGhpcy5fZWRpdG9yID0gbmV3IEZyb2FsYUVkaXRvcihcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLl9vcHRzXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SHRtbCgpIHtcbiAgICB0aGlzLl9lZGl0b3IuaHRtbC5zZXQodGhpcy5fbW9kZWwgfHwgXCJcIik7XG5cbiAgICAvLyBUaGlzIHdpbGwgcmVzZXQgdGhlIHVuZG8gc3RhY2sgZXZlcnl0aW1lIHRoZSBtb2RlbCBjaGFuZ2VzIGV4dGVybmFsbHkuIENhbiB3ZSBmaXggdGhpcz9cbiAgICB0aGlzLl9lZGl0b3IudW5kby5yZXNldCgpO1xuICAgIHRoaXMuX2VkaXRvci51bmRvLnNhdmVTdGVwKCk7XG4gIH1cblxuICBwcml2YXRlIHNldENvbnRlbnQoZmlyc3RUaW1lID0gZmFsc2UpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTZXQgaW5pdGlhbCBjb250ZW50XG4gICAgaWYgKHRoaXMuX21vZGVsIHx8IHRoaXMuX21vZGVsID09ICcnKSB7XG4gICAgICB0aGlzLl9vbGRNb2RlbCA9IHRoaXMuX21vZGVsO1xuICAgICAgaWYgKHRoaXMuX2hhc1NwZWNpYWxUYWcpIHtcblxuICAgICAgICBsZXQgdGFnczogT2JqZWN0ID0gdGhpcy5fbW9kZWw7XG5cbiAgICAgICAgLy8gYWRkIHRhZ3Mgb24gZWxlbWVudFxuICAgICAgICBpZiAodGFncykge1xuXG4gICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiB0YWdzKSB7XG4gICAgICAgICAgICBpZiAodGFncy5oYXNPd25Qcm9wZXJ0eShhdHRyKSAmJiBhdHRyICE9IHRoaXMuSU5ORVJfSFRNTF9BVFRSKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsIHRhZ3NbYXR0cl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0YWdzLmhhc093blByb3BlcnR5KHRoaXMuSU5ORVJfSFRNTF9BVFRSKSkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5pbm5lckhUTUwgPSB0YWdzW3RoaXMuSU5ORVJfSFRNTF9BVFRSXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaXJzdFRpbWUpIHtcbiAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoJ2luaXRpYWxpemVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXRIdG1sKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5zZXRIdG1sKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRvckluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZWRpdG9ySW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEVkaXRvcigpIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHNlbmQgbWFudWFsIGVkaXRvciBpbml0aWFsaXphdGlvblxuICBwcml2YXRlIGdlbmVyYXRlTWFudWFsQ29udHJvbGxlcigpIHtcbiAgICBsZXQgY29udHJvbHMgPSB7XG4gICAgICBpbml0aWFsaXplOiB0aGlzLmNyZWF0ZUVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgZGVzdHJveTogdGhpcy5kZXN0cm95RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICBnZXRFZGl0b3I6IHRoaXMuZ2V0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICB0aGlzLmZyb2FsYUluaXQuZW1pdChjb250cm9scyk7XG4gIH1cblxuICAvLyBUT0RPIG5vdCBzdXJlIGlmIG5nT25Jbml0IGlzIGV4ZWN1dGVkIGFmdGVyIEBpbnB1dHNcbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIC8vIGNoZWNrIGlmIG91dHB1dCBmcm9hbGFJbml0IGlzIHByZXNlbnQuIE1heWJlIG9ic2VydmVycyBpcyBwcml2YXRlIGFuZCBzaG91bGQgbm90IGJlIHVzZWQ/PyBUT0RPIGhvdyB0byBiZXR0ZXIgdGVzdCB0aGF0IGFuIG91dHB1dCBkaXJlY3RpdmUgaXMgcHJlc2VudC5cbiAgICBpZiAoIXRoaXMuZnJvYWxhSW5pdC5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmNyZWF0ZUVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdlbmVyYXRlTWFudWFsQ29udHJvbGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveUVkaXRvcigpO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gIH1cbn1cbiJdfQ==