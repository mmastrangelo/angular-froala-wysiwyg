import { Directive, ElementRef, Renderer2, Input } from '@angular/core';
export class FroalaViewDirective {
    constructor(renderer, element) {
        this.renderer = renderer;
        this._element = element.nativeElement;
    }
    // update content model as it comes
    set froalaView(content) {
        this._element.innerHTML = content;
    }
    ngAfterViewInit() {
        this.renderer.addClass(this._element, "fr-view");
    }
}
FroalaViewDirective.decorators = [
    { type: Directive, args: [{
                selector: '[froalaView]'
            },] }
];
/** @nocollapse */
FroalaViewDirective.ctorParameters = () => [
    { type: Renderer2 },
    { type: ElementRef }
];
FroalaViewDirective.propDecorators = {
    froalaView: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9wcm9qZWN0cy9saWJyYXJ5L3NyYy92aWV3L3ZpZXcuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFLeEUsTUFBTSxPQUFPLG1CQUFtQjtJQUk5QixZQUFvQixRQUFtQixFQUFFLE9BQW1CO1FBQXhDLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsSUFBYSxVQUFVLENBQUMsT0FBZTtRQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7SUFDcEMsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7OztZQWxCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7YUFDekI7Ozs7WUFKK0IsU0FBUztZQUFyQixVQUFVOzs7eUJBYzNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFJlbmRlcmVyMiwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Zyb2FsYVZpZXddJ1xufSlcbmV4cG9ydCBjbGFzcyBGcm9hbGFWaWV3RGlyZWN0aXZlIHtcblxuICBwcml2YXRlIF9lbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsIGVsZW1lbnQ6IEVsZW1lbnRSZWYpIHtcbiAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgLy8gdXBkYXRlIGNvbnRlbnQgbW9kZWwgYXMgaXQgY29tZXNcbiAgQElucHV0KCkgc2V0IGZyb2FsYVZpZXcoY29udGVudDogc3RyaW5nKSB7XG4gICAgdGhpcy5fZWxlbWVudC5pbm5lckhUTUwgPSBjb250ZW50O1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5fZWxlbWVudCwgXCJmci12aWV3XCIpO1xuICB9XG59XG4iXX0=