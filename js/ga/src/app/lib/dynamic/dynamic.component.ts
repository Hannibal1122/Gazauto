import { Component, ViewChild, ViewContainerRef, Input, ComponentFactoryResolver, ReflectiveInjector, Output, EventEmitter } from "@angular/core";
import { ExplorerComponent } from "../../software/explorer/explorer.component";
import { TableEditorComponent } from "../../software/table-editor/table-editor.component";
import { InfoComponent } from "../../software/info/info.component";
declare var trace: any;

@Component({
  selector: "vg-dynamic-view",
  template: "<div #container></div>",
  entryComponents: [ExplorerComponent, TableEditorComponent, InfoComponent],
})
export class DynamicComponent
{
    currentComponent = null;
    @ViewChild("container", {read: ViewContainerRef}) container:ViewContainerRef;
    @Input() set componentData(data: {component: any, inputs: any, appendFromLeftMenu: any }) 
    {
        if (!data) return;
        let inputProviders = [];//Object.keys(data.inputs).map((inputName) => { return { provide: inputName, useValue: data.inputs[inputName] }; });
        let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
        let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.container.parentInjector);
        let factory = this.resolver.resolveComponentFactory(data.component);
        let component:any = factory.create(injector);
        component._component.inputs = data.inputs;

        if(data.appendFromLeftMenu) data.appendFromLeftMenu = component._component.appendFromLeftMenu; // Для таблиц

        component._component.onChange = (e) => { this.onChange.emit(e); };
        this.container.insert(component.hostView);
        if (this.currentComponent) this.currentComponent.destroy();
        this.currentComponent = component;
    }
    @Input() set inputFromApp(value)
    {
        this.currentComponent._component.inputFromApp = value;
    }
    @Output() onChange = new EventEmitter<any>();
    constructor(private resolver: ComponentFactoryResolver) { }
}