import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
declare var trace:any;

@Injectable()
export class CreateValueService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(_idParent, update, data)
    {
        let idParent = _idParent ? _idParent : data.parent;
        var Data:any = {
            title: "<b>" + (data ? "Изменение" : "Добавление") + " значения</b>",  
            data: [
                ["Тип", data ? "" : { selected: "value", data: ["Значение", "Список", "Состояние"], value: ["value", "array", "state"] }, data ? "html" : "select", { onselect: (value) =>
                {
                    switch(value)
                    {
                        case "value": 
                            this.modal.Data[2] = ["Значение", "", "text"];
                            break;
                        case "array":
                            this.modal.Data[2] = ["Список", [], "listTable", []];
                            break;
                        case "state":
                            this.modal.Data[2] = ["Список", [], "listTable", []];
                            break;
                    }
                }}], 
                ["Название", data ? data.name : "", data ? "html" : "text"], 
                ["Значение", "", "text"]],
            ok: data ? "Изменить" : "Добавить",
            cancel: "Отмена"
        };
        var valueType = "";
        if(data)
        {
            this.query.protectionPost(303, { param: [ data.id ] }, (data) => 
            {
                let list = [];
                let i = 0;
                valueType = data[1];
                switch(data[1])
                {
                    case "value": 
                        this.modal.Data[0][1] = "Значение"; 
                        this.modal.Data[2][1] = data[2];
                        break;
                    case "array": 
                        list = data[2];
                        for(; i < list.length; i++) list[i] = { value: list[i] };
                        this.modal.Data[0][1] = "Список"; 
                        this.modal.Data[2] = ["Список", list, "listTable", []];
                        break;
                    case "state": 
                        list = data[2];
                        for(; i < list.length; i++) list[i] = { value: list[i] };
                        this.modal.Data[0][1] = "Состояние"; 
                        this.modal.Data[2] = ["Список", list, "listTable", []];
                        break;
                }
            });
        }
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                let out = this.modal.Data[2][1];
                let type = data ? valueType : this.modal.Data[0][1].selected;
                if(type == "array") // "Список" - это для загруженных 
                {
                    let i = 0;
                    for(; i < out.length; i++) out[i] = out[i].value;
                }
                if(data)
                    this.query.protectionPost(301, { param: [ data.id, type, out ] }, (data) => 
                    {
                        update();
                    });
                else
                    this.query.protectionPost(100, { param: ["value", "NULL", Data.data[1][1], idParent, 0, ""] }, (data) => 
                    {  
                        if(data[0] == "Index")
                            this.query.protectionPost(300, { param: [ data[1], type, out ] }, (data) => 
                            {
                                update();
                            });
                    });
            }
        });
    }
    remove(id, update)
    {
        var Data:any = {
            title: "Вы действительно хотите удалить элемент? (" + id + ")",  
            data: [],
            ok: "Да",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save) =>
        {
            if(save)
                this.query.protectionPost(302, { param: [id] }, (data) => 
                { 
                    update();
                });
        });
    }
}
