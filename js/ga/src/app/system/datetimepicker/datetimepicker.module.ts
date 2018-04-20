import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';  
import { DateTimeComponent } from "./datetimepicker.component";
import { ModuleWithProviders } from '@angular/core';

@NgModule({
    declarations: [DateTimeComponent ],
    imports: [FormsModule, BrowserModule],
    exports: [DateTimeComponent]
})
export class DateTimeModule{}
