import { Component, OnInit, ViewChild, Input } from '@angular/core';
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
    operator = [{id: "И", value: "И"}, { id: "ИЛИ", value: "ИЛИ" }];
    operand = [
        { id: "содержит", value: "содержит"}, 
        { id: "не содержит", value: "не содержит" }, 
        { id: "начинается", value: "начинается"}, 
        { id: "заканчивается", value: "заканчивается"},
        { id: "равно", value: "равно"},
        { id: "не равно", value: "не равно"}
    ];
    fields = [];
    mapField = {};
    expression = [];
    @Input() set config(value)
    {
        if(value)
            this.open(value.fields, value.expression);
    }
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
    }
    open(fields, expression)
    {
        this.fields = [];
        this.mapField = {};
        for(let i = 0; i < fields.length; i++)
        {
            this.fields.push(fields[i]);
            this.mapField[fields[i].id] = fields[i].value;
        }
        this.expression = Array.isArray(expression) ? expression : this.parseExpression(expression);
    }
    parseExpression(str)
    {
        return str ? JSON.parse(str) : [];
    }
    addCondition(i?)
    {
        if(i === undefined) this.expression.push({ type: "condition", field: 1, operand: "содержит", value: "", operator: "И" });
        else this.expression.splice(i, 0, { type: "condition", field: 1, operand: "содержит", value: "", operator: "И" });
    }
    removeCondition(i, type)
    {
        if(type === "group")
        {
            let j = i;
            let k = 0;
            for(; j >= 0; j--)
            {
                if(this.expression[j].begin) k--;
                if(this.expression[j].begin === false) k++;
                if(k == 0) break;
            }
            this.expression.splice(j, i - j + 1);
        }
        else this.expression.splice(i, 1);
    }
    addGroup(i?)
    {
        if(i === undefined)
            this.expression.push({ type: "group", begin: true }, { type: "group", begin: false, operator: "И" });
        else this.expression.splice(i, 0, { type: "group", begin: true }, { type: "group", begin: false, operator: "И" });
    }
    setEdit(e, type)
    {
        e[type + "_edit"] = true;
    }
    endEdit(e, type)
    {
        e[type + "_edit"] = false;
    }
    getCondition()
    {
        return JSON.stringify(this.expression);
    }
}