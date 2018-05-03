import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
declare var trace:any;
declare var $:any;
@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.css']
})
export class ErrorTableComponent implements OnInit 
{
    @ViewChild("mainContainer") mainContainer:ElementRef;
    @ViewChild("mainEditElement") mainEditElement:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    header = [];
    firstHeader = {};
    listTables = [];
    firstData = [];

    constructor() { }
    ngOnInit() 
    {
    }
    @Input() set head(value)
    {
        if(value)
        {
            this.header = [];
            this.firstHeader = {};
            for(var key in value)
            {
                this.firstHeader[value[key].value] = value[key].i;
                this.header[value[key].i] = value[key];
            }
        }
    }
    @Input() set data(value)
    {
        if(value)
        {
            this.firstData = [];
            this.listTables = [];
            for(var i = 0; i < value.length; i++)
            {
                this.listTables[i] = [];
                for(var key in value[i])
                    if(this.firstHeader[key] != undefined)
                        this.listTables[i][this.firstHeader[key]] = value[i][key];
                this.firstData[i] = value[i];
            }
        }
    }
    configInput = 
    {
        width: "100px",
        height: "10px",
        top: "0px",
        left: "0px"
    }
    inputProperty = 
    {
        value: "",
        visible: false,
        i: -1, 
        j: -1
    }
    editField(e)
    {
        let i = -1;
        let j = -1;
        let element = $(e.target);
        let a = element.attr("id") ? element.attr("id").split("_") : [];
        if(a.length == 2)
        {

            i = Number(a[0]);
            j = Number(a[1]);

            let mainOffset = $(this.mainContainer.nativeElement).offset();
            let offset = element.offset();
            this.configInput.top = (offset.top - mainOffset.top) + "px";
            this.configInput.left = (offset.left - mainOffset.left) + "px";
            this.configInput.width = (e.target.clientWidth + 1) + "px";
            this.configInput.height = (e.target.clientHeight + 1) + "px";

            this.inputProperty.value = this.listTables[i][j];
            this.inputProperty.visible = true;
            this.inputProperty.i = i;
            this.inputProperty.j = j;
            setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
        }
    }
    acceptEditField()
    {
        trace(this.inputProperty)
        this.inputProperty.visible = false;
    }
}
