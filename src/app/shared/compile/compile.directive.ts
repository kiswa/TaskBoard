import {
    Compiler,
    Component,
    ComponentRef,
    Directive,
    Input,
    ModuleWithComponentFactories,
    NgModule,
    OnChanges,
    Type,
    ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
    selector: '[compile]'
})
export class CompileDirective implements OnChanges {
    @Input() compile: string;
    @Input() compileContext: any;

    compRef: ComponentRef<any>;

    constructor(private vcRef: ViewContainerRef,
                private compiler: Compiler) { }

    ngOnChanges() {
        if (!this.compile) {
            if (this.compRef) {
                this.updateProperties();
                return;
            }

            throw Error('You forgot to provide template');
        }

        this.vcRef.clear();
        this.compRef = null;

        const component = this.createDynamicComponent(this.compile);
        const module = this.createDynamicModule(component);

        this.compiler.compileModuleAndAllComponentsAsync(module)
            .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
                let compFactory = moduleWithFactories.componentFactories
                    .find(x => x.componentType === component);

                this.compRef = this.vcRef.createComponent(compFactory);
                this.updateProperties();
            })
            .catch(error => {
                console.error(error); // tslint:disable-line
            });
    }

    updateProperties() {
        for (let prop in this.compileContext) {
            if (this.compileContext.hasOwnProperty(prop)) {
                this.compRef.instance[prop] = this.compileContext[prop];
            }
        }
    }

    private createDynamicComponent (template: string) {
        @Component({
            selector: 'custom-dynamic-component',
            template
        })
        class CustomDynamicComponent {}

        return CustomDynamicComponent;
    }

    private createDynamicModule (component: Type<any>) {
        @NgModule({
            imports: [CommonModule],
            declarations: [component]
        })
        class DynamicModule {}

        return DynamicModule;
    }
}

