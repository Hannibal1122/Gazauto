import { Component, ViewChild, ViewContainerRef, Input, ComponentFactoryResolver, ReflectiveInjector, Output, EventEmitter } from "@angular/core";
import { ExplorerComponent } from "../../software/explorer/explorer.component";
import { EventEditorComponent } from "../../software/event-editor/event-editor.component";
import { PlanEditorComponent } from "../../software/plan-editor/plan-editor.component";
import { EventLogComponent } from "../../software/event-log/event-log.component";
import { TemplateConstructorComponent } from '../../software/template-constructor/template-constructor.component'
import { StatisticsEditorComponent } from '../../software/statistics-editor/statistics-editor.component'

import { InfoComponent } from "../../software/info/info.component";
declare var trace: any;

@Component({
    selector: "vg-dynamic-view",
    template: "<div #container></div>",
    entryComponents: [ExplorerComponent, EventEditorComponent, PlanEditorComponent, InfoComponent, EventLogComponent, TemplateConstructorComponent, StatisticsEditorComponent],
})
export class DynamicComponent
{
    currentComponent = null;
    @ViewChild("container", {read: ViewContainerRef}) container:ViewContainerRef;
    @Input() set componentData(data: {component: any, inputs: any }) 
    {
        if (!data) return;
        let inputProviders = [];//Object.keys(data.inputs).map((inputName) => { return { provide: inputName, useValue: data.inputs[inputName] }; });
        let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
        let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.container.parentInjector);
        let factory = this.resolver.resolveComponentFactory(data.component);
        let component:any = factory.create(injector);
        component._component.inputs = data.inputs;

        component._component.onChange = (e) => { this.onChange.emit(e); };
        this.container.insert(component.hostView);
        if (this.currentComponent) this.currentComponent.destroy();
        this.currentComponent = component;
    }
    @Input() set inputFromApp(value)
    {
        this.currentComponent._component.inputFromApp = value;
    }
    @Input() set visible(value)
    {
        this.currentComponent._component.visible = value;
    }
    @Output() onChange = new EventEmitter<any>();
    constructor(private resolver: ComponentFactoryResolver) { }
}