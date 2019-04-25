import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';  
import { ModalWindowComponent } from "./modalwindow.component";
import { ModuleWithProviders } from '@angular/core';
import { DateTimeModule } from "../datetimepicker/datetimepicker.module";
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { FilterEditorComponent } from '../../software/filter-editor/filter-editor.component';

@NgModule({
    declarations: [ModalWindowComponent, FileUploaderComponent, FilterEditorComponent],
    imports: [FormsModule, BrowserModule, DateTimeModule],
    exports: [ModalWindowComponent]
})
export class ModalWindowModule{}
