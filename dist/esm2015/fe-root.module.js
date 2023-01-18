import { NgModule } from '@angular/core';
import { FroalaEditorModule } from './editor/editor.module';
import { FroalaViewModule } from './view/view.module';
export class FERootModule {
}
FERootModule.decorators = [
    { type: NgModule, args: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmUtcm9vdC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9wcm9qZWN0cy9saWJyYXJ5L3NyYy9mZS1yb290Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBWXRELE1BQU0sT0FBTyxZQUFZOzs7WUFWeEIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7b0JBQzVCLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtpQkFDM0I7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGtCQUFrQjtvQkFDbEIsZ0JBQWdCO2lCQUNqQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZyb2FsYUVkaXRvck1vZHVsZSB9IGZyb20gJy4vZWRpdG9yL2VkaXRvci5tb2R1bGUnO1xuaW1wb3J0IHsgRnJvYWxhVmlld01vZHVsZSB9IGZyb20gJy4vdmlldy92aWV3Lm1vZHVsZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBGcm9hbGFFZGl0b3JNb2R1bGUuZm9yUm9vdCgpLFxuICAgIEZyb2FsYVZpZXdNb2R1bGUuZm9yUm9vdCgpXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBGcm9hbGFFZGl0b3JNb2R1bGUsXG4gICAgRnJvYWxhVmlld01vZHVsZVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEZFUm9vdE1vZHVsZSB7XG5cbn1cbiJdfQ==