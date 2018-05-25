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
import { TableEditorComponent } from './software/table-editor/table-editor.component';
import { ErrorTableComponent } from './system/error-table/error-table.component';
import { InfoComponent } from './software/info/info.component';
import { TasksComponent } from './software/tasks/tasks.component'

@NgModule({
    declarations: [ 
        AppComponent, 
        LeftMenuElementComponent, 
        ExplorerComponent, 
        DynamicComponent, 
        EnterComponent, LoadingComponent, TableEditorComponent, ErrorTableComponent, InfoComponent, TasksComponent
    ],
    imports: [ BrowserModule, FormsModule, ModalWindowModule ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
