import { ElementRef, Renderer2 } from '@angular/core';
export declare class FroalaViewDirective {
    private renderer;
    private _element;
    constructor(renderer: Renderer2, element: ElementRef);
    set froalaView(content: string);
    ngAfterViewInit(): void;
}
