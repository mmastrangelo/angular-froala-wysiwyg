import { NgModule } from '@angular/core';
import { FroalaEditorDirective } from './editor.directive';
export class FroalaEditorModule {
    static forRoot() {
        return { ngModule: FroalaEditorModule, providers: [] };
    }
}
FroalaEditorModule.decorators = [
    { type: NgModule, args: [{
                declarations: [FroalaEditorDirective],
                exports: [FroalaEditorDirective]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Byb2plY3RzL2xpYnJhcnkvc3JjL2VkaXRvci9lZGl0b3IubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBTzNELE1BQU0sT0FBTyxrQkFBa0I7SUFDdEIsTUFBTSxDQUFDLE9BQU87UUFDbkIsT0FBTyxFQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDdkQsQ0FBQzs7O1lBUkYsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLHFCQUFxQixDQUFDO2dCQUNyQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQzthQUNqQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZyb2FsYUVkaXRvckRpcmVjdGl2ZSB9IGZyb20gJy4vZWRpdG9yLmRpcmVjdGl2ZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0Zyb2FsYUVkaXRvckRpcmVjdGl2ZV0sXG4gIGV4cG9ydHM6IFtGcm9hbGFFZGl0b3JEaXJlY3RpdmVdXG59KVxuXG5leHBvcnQgY2xhc3MgRnJvYWxhRWRpdG9yTW9kdWxlIHtcbiAgcHVibGljIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8RnJvYWxhRWRpdG9yTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtuZ01vZHVsZTogRnJvYWxhRWRpdG9yTW9kdWxlLCBwcm92aWRlcnM6IFtdfTtcbiAgfVxufVxuIl19