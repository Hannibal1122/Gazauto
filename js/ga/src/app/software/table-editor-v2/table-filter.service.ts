import { Injectable } from '@angular/core';
declare var trace:any;
@Injectable()
export class TableFilterService
{
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
            case "!<=":
                if(value1 <= value2) return false;
                break;
        }
        return true;
    }
}
