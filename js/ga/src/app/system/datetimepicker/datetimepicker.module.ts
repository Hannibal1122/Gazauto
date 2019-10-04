import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser';
import { DateTimeComponent } from "./datetimepicker.component";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [DateTimeComponent ],
    imports: [FormsModule, BrowserModule, TranslateModule],
    exports: [DateTimeComponent]
})
export class DateTimeModule{}