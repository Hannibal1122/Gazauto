import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var FasmEditor:any;
declare var trace:any;
@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.css']
})
export class EventEditorComponent implements OnInit 
{
    @ViewChild("editor") public editor:ElementRef;
    inputs:any = {};
    constructor(public query: QueryService) { }
    fasmEditor;
    name = "";
    type = "";
    info = "";
    ready = false;
    readonly = false;
    ngOnInit() 
    {
        this.query.protectionPost(411, { param: [ this.inputs.id ] }, (data) =>
        {
            this.inputs.name = this.name = data[5];
            this.ready = data[4] == 1;
            this.readonly = data[6];
            this.fasmEditor = new FasmEditor("#2E2E2E", null, null, this.readonly);
            this.editor.nativeElement.appendChild(this.fasmEditor.create());
            switch(data[0])
            {
                case "value": this.type = "по значению"; break;
                case "state": this.type = "по статусу"; break;
                case "date": 
                    this.type = "по дате"; 
                    let date = data[1].split(" ");
                    let a = date[0].split("-");
                    if(data[1].indexOf("xxxx-xx-xx ") != -1) this.info = "Каждый день в " + date[1];
                    else if(data[1].indexOf("xxxx-xx-") != -1) this.info = "Каждый месяц " + a[2] + " числа в " + date[1];
                    else if(data[1].indexOf("xxxx-") != -1) this.info = "Каждый год " + a[1] + " месяца " + a[2] + " числа в " + date[1];
                    else this.info = data[1];
                    break;
            }
            this.fasmEditor.setText(data[3]);
        });
    }
    saveCode()
    {
        this.query.protectionPost(412, { param: [ this.inputs.id, this.fasmEditor.getFullText() ] }, (data) =>
        {
            trace(data)
        });
    }
    execCode()
    {
        this.query.protectionPost(413, { param: [ this.inputs.id ] }, (data) =>
        {
            trace(data)
        });
    }
    stopEvent()
    {
        this.query.protectionPost(415, { param: [ this.inputs.id ] }, (data) =>
        {
            this.ready = true;
        });
    }
    returnEvent()
    {
        this.query.protectionPost(416, { param: [ this.inputs.id ] }, (data) =>
        {
            this.ready = false;
        });
    }
}
