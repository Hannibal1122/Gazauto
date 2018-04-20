import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';  
import { ModalWindowComponent } from "./modalwindow.component";
import { ModuleWithProviders } from '@angular/core';
import { DateTimeModule } from "../datetimepicker/datetimepicker.module";
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';

@NgModule({
    declarations: [ModalWindowComponent, FileUploaderComponent],
    imports: [FormsModule, BrowserModule, DateTimeModule],
    exports: [ModalWindowComponent]
})
export class ModalWindowModule{}
