import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LeftMenuElementComponent } from './left-menu-element/left-menu-element.component';
import { FormsModule }   from '@angular/forms';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { DynamicComponent } from './lib/dynamic/dynamic.component';
import { EnterComponent } from './enter/enter.component';
import { ModalWindowModule } from "./system/modalwindow/modalwindow.module";
import { LoadingComponent } from './system/loading/loading.component';
import { TableEditorV2Component } from './software/table-editor-v2/table-editor-v2.component';
import { PlanEditorComponent } from './software/plan-editor/plan-editor.component';
import { InfoComponent } from './software/info/info.component';
import { HttpClientModule } from '@angular/common/http';
import { UserSettingsComponent } from './software/user-settings/user-settings.component';
import { EventEditorComponent } from './software/event-editor/event-editor.component';
import { EventLogComponent } from './software/event-log/event-log.component';
import { ModalMovedWindowComponent } from './system/modal-moved-window/modal-moved-window.component';
import { TemplateConstructorComponent } from './software/template-constructor/template-constructor.component';
import { TablePropertyComponent } from './software/explorer/tableProperty.component';
import { TableHeaderEditorComponent } from './software/table-editor-v2/table-header-editor.component';
import { CreateTemplateComponent } from './software/explorer/create-template.component'
import { StatisticsEditorComponent } from './software/statistics-editor/statistics-editor.component'
import { DateTimeModule } from "./system/datetimepicker/datetimepicker.module";

@NgModule({
    declarations: [ 
        AppComponent, 
        LeftMenuElementComponent, 
        ExplorerComponent, 
        DynamicComponent, 
        UserSettingsComponent,
        EnterComponent, 
        LoadingComponent, 
        TableEditorV2Component,
        InfoComponent,
        EventEditorComponent,
        PlanEditorComponent,
        ModalMovedWindowComponent,
        TemplateConstructorComponent,
        EventLogComponent,
        TablePropertyComponent,
        TableHeaderEditorComponent,
        CreateTemplateComponent,
        StatisticsEditorComponent
    ],
    imports: [ BrowserModule, FormsModule, ModalWindowModule, HttpClientModule, DateTimeModule ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
