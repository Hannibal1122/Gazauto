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
    operator = [{id: "И", value: "И"}, { id: "ИЛИ", value: "ИЛИ" }];
    operand = [
        { id: "содержит", value: "содержит"}, 
        { id: "не содержит", value: "не содержит" }, 
        { id: "начинается", value: "начинается"}, 
        { id: "заканчивается", value: "заканчивается"},
        { id: "равно", value: "равно"},
        { id: "не равно", value: "не равно"}
    ];
    field = [{id: 0, value: "test 1"}, {id: 1, value: "test 2"}];
    mapField = {
        0: "test 1",
        1: "test 2"
    };
    expression = [];
    constructor()
    {
    }
    ngOnInit()
    {
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
    saveCondition()
    {
        let str = "";
        for(let i = 0; i < this.expression.length; i++)
        {
            if(this.expression[i].type === "group")
            {
                if(this.expression[i].begin) str += " (";
                if(!this.expression[i].begin) 
                {
                    str += ") ";
                    if(this.expression[i + 1])
                        str += this.getOperator(this.expression[i].operator);
                }
            }
            else
            {
                if(this.expression[i].value !== "")
                {
                    str += this.expression[i].field + this.getOperand(this.expression[i].operand, this.expression[i].value);
                    if(this.expression[i + 1] && (this.expression[i + 1].type === "condition" || this.expression[i + 1].begin))
                        str += this.getOperator(this.expression[i].operator);
                }
            }
        }
        trace(str);
    }
    getOperand(operand, value)
    {
        switch(operand)
        {
            case "содержит": return " LIKE %" + value + "%";
            case "не содержит": return " NOT LIKE %" + value + "%";
            case "начинается": return " LIKE " + value + "%";
            case "заканчивается": return " LIKE %" + value + "";
            case "равно": return " LIKE " + value + "";
            case "не равно": return " NOT LIKE " + value + "";
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