import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { FunctionsService } from '../../lib/functions.service';
declare var trace:any;

@Injectable()
export class CreateEventService 
{
    constructor(public query: QueryService, public functions: FunctionsService) 
    { 
    }
    modal;
    create(_idParent, update)
    {
        let idParent = _idParent;
        var Data:any = {
            title: "<b>Создание события</b>",  
            data: [
                ["Название", "", "text"], 
                ["Тип события", { selected: "value", data: ["Значение", "Статус", "По дате"], value: ["value", "state", "date"]}, "select", { onselect: (value) =>
                {
                    if(value == "date")
                    {
                        this.modal.Data[2] = ["Время", "", "datetime"];
                        this.modal.Data[3] = ["Тип", {  selected: "one-off", 
                                                        data: ["Один раз", "Каждый день", "Каждый месяц", "Каждый год"], 
                                                        value: ["one-off", "day", "month", "year"]}, "select"]
                    }
                    else this.modal.Data.splice(2, 2);
                }}]],
            ok: "Создать",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                let param = "";
                if(Data.data[1][1].selected == "date")
                {
                    let format = "yyyy-MM-dd HH:mm";
                    switch(Data.data[3][1].selected)
                    {
                        case "day": format = "xxxx-xx-xx HH:mm"; break;
                        case "month": format = "xxxx-xx-dd HH:mm"; break;
                        case "year": format = "xxxx-MM-dd HH:mm"; break;
                    }
                    param = this.functions.getFormatForMilliseconds(Data.data[2][1], format);
                }
                this.query.protectionPost(100, { param: ["event", "NULL", Data.data[0][1], idParent, 0, ""] }, (data) => 
                {  
                    if(data[0] == "Index")
                        this.query.protectionPost(410, { param: [idParent, data[1], Data.data[1][1].selected, param ] }, (data) => 
                        {  
                            update();
                        });
                });
            }
        });
    }
}
