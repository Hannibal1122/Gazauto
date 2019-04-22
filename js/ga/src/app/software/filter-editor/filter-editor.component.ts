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
    private _open = false;
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
    parentId = -1;
    id = -1;
    name = "";
    updateExplorer;
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
    }
    create(parentId, fields, updateExplorer)
    {
        this.id = -1;
        this.parentId = parentId;
        this.updateExplorer = updateExplorer;
        this.open(fields, []);
    }
    update(id, fields, expression)
    {
        this.id = id;
        this.open(fields, expression);
    }
    save()
    {
        if(this.id == -1)
        {
            this.query.protectionPost(470, { param: [this.parentId, this.getCondition()] }, (data) => 
            { 
                this.query.protectionPost(100, { param: ["filter", data[0], this.name, this.parentId, 0, ""] }, (data) => 
                { 
                    if(this.updateExplorer) this.updateExplorer();
                    this.cancel();
                });
            });
        }
        else
            this.query.protectionPost(471, { param: [this.id, this.getCondition()] }, () => 
            { 
                this.cancel();
            });
    }
    open(fields, expression)
    {
        this._open = true;
        this.fields = [];
        this.mapField = {};
        for(let i = 0; i < fields.length; i++)
        {
            this.fields.push(fields[i]);
            this.mapField[fields[i].id] = fields[i].value;
        }
        this.expression = Array.isArray(expression) ? expression : this.parseExpression(expression);
    }
    cancel()
    {
        this._open = false;
    }
    parseExpression(str)
    {
        return [];
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
        let str = "";
        for(let i = 0; i < this.expression.length; i++)
        {
            if(this.expression[i].type === "group")
            {
                if(this.expression[i].begin) str += "(";
                if(!this.expression[i].begin) 
                {
                    str += ")";
                    if(this.expression[i + 1])
                        str += this.getOperator(this.expression[i].operator);
                }
            }
            else
            {
                if(this.expression[i].value !== "")
                {
                    str += "idColumn = " + this.expression[i].field + " AND value " + this.getOperand(this.expression[i].operand, this.expression[i].value);
                    if(this.expression[i + 1] && (this.expression[i + 1].type === "condition" || this.expression[i + 1].begin))
                        str += this.getOperator(this.expression[i].operator);
                }
            }
        }
        return str;
    }
    getOperand(operand, value)
    {
        switch(operand)
        {
            case "содержит": return "LIKE %" + value + "%";
            case "не содержит": return "NOT LIKE %" + value + "%";
            case "начинается": return "LIKE " + value + "%";
            case "заканчивается": return "LIKE %" + value + "";
            case "равно": return "LIKE " + value + "";
            case "не равно": return "NOT LIKE " + value + "";
        }
    }
    getOperator(operator)
    {
        switch(operator)
        {
            case "И": return " AND ";
            case "ИЛИ": return " OR ";
        }
    }
}