import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
@Component({
    selector: 'app-filter-editor',
    templateUrl: './filter-editor.component.html',
    styleUrls: ['./filter-editor.component.css'],
    providers: [ QueryService ]
})
export class FilterEditorComponent implements OnInit 
{
    operator = ["И", "ИЛИ"];
    operand = ["содержит", "не содержит", "начинается", "заканчивается", "равно", "не равно"];
    field = [{id: 0, value: "test 1"}, {id: 1, value: "test 2"}]
    expression = [{ type: "field", value: 1}, { type: "operand", value: "содержит"}, { type: "value", value: ""}, { type: "operator", value: "И"}];
    constructor()
    {
    }
    ngOnInit()
    {
    }
}