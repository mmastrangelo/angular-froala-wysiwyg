import { NgModule } from '@angular/core';
import { FroalaViewDirective } from './view.directive';
export class FroalaViewModule {
    static forRoot() {
        return { ngModule: FroalaViewModule, providers: [] };
    }
}
FroalaViewModule.decorators = [
    { type: NgModule, args: [{
                declarations: [FroalaViewDirective],
                exports: [FroalaViewDirective]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9wcm9qZWN0cy9saWJyYXJ5L3NyYy92aWV3L3ZpZXcubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBTXZELE1BQU0sT0FBTyxnQkFBZ0I7SUFDcEIsTUFBTSxDQUFDLE9BQU87UUFDbkIsT0FBTyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDckQsQ0FBQzs7O1lBUEYsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLG1CQUFtQixDQUFDO2dCQUNuQyxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQzthQUMvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEZyb2FsYVZpZXdEaXJlY3RpdmUgfSBmcm9tICcuL3ZpZXcuZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbRnJvYWxhVmlld0RpcmVjdGl2ZV0sXG4gIGV4cG9ydHM6IFtGcm9hbGFWaWV3RGlyZWN0aXZlXVxufSlcbmV4cG9ydCBjbGFzcyBGcm9hbGFWaWV3TW9kdWxlIHtcbiAgcHVibGljIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8RnJvYWxhVmlld01vZHVsZT4ge1xuICAgIHJldHVybiB7bmdNb2R1bGU6IEZyb2FsYVZpZXdNb2R1bGUsIHByb3ZpZGVyczogW119O1xuICB9XG59XG4iXX0=