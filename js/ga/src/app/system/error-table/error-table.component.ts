import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
declare var trace:any;
@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.css']
})
export class ErrorTableComponent implements OnInit 
{
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
            trace(this.firstHeader)
            trace(this.firstData)
            trace(this.listTables)
        }
    }
}
