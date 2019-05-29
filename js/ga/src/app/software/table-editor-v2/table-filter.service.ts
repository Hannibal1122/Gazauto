import { Injectable } from '@angular/core';
declare var trace:any;
@Injectable()
export class TableFilterService
{
    enable = false;
    fields = [];
    state = [];
    count = 0;
    countHide = 0;
    mapHideRows = {}; // По этому объекту скрываются строки не подходящие по фильтру
    constructor()
    {

    }
    checkFilterBySign(value1, value2, sign)
    {
        switch(sign)
        {
            case "=":
                if(value1 == value2) return false;
                break;
            case "!=":
                if(value1 != value2) return false;
                break;
            case "*":
                if(value1.indexOf(value2) !== -1) return false;
                break;
            case "!*":
                if(value1.indexOf(value2) === -1) return false;
                break;
        }
        return true;
    }
    checkFilterBySignState(value1, value2, sign)
    {
        switch(sign)
        {
            case "=":
                if(value1 == value2) return false;
                break;
            case "!=":
                if(value1 != value2) return false;
                break;
            case ">":
                if(value1 > value2) return false;
                break;
            case ">=":
                if(value1 >= value2) return false;
                break;
            case "<":
                if(value1 < value2) return false;
                break;
            case "<=":
                if(value1 <= value2) return false;
                break;
        }
        return true;
    }
    append(j)
    {
        this.fields[j] = { value: "", sign: "*" };
        this.state[j] = { value: "", sign: "=" };
    }
    flush(j)
    {
        this.fields[j] = null;
        this.state[j] = null;
    }
    splice(j)
    {
        this.fields.splice(j);
        this.state.splice(j);
    }
    changeEnamle()
    {
        this.enable = !this.enable;
    }
    clear()
    {
        for(let i = 0; i < this.fields.length; i++)
            if(this.fields[i])
                this.fields[i].value = this.state[i].value = "";
    }
}
