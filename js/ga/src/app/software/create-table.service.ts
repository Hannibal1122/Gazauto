import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateTableService
{
    Data:any = {
        title: "Создание таблицы",  
        data: [
            ["Имя", "", "text"]
        ],
        ok: "Создать",
        cancel: "Отмена"
    };

    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(id, update)
    {
        this.Data.data[0][1] = "Новая таблица";
        this.modal.open(this.Data, (save) =>
        {
            if(save)
            {
                if(this.Data.data[0][1] == "") return "Введите имя!";
                this.query.protectionPost(100, { param: ["table", "NULL", this.Data.data[0][1], id, 0, ""] }, (data) => { update() });
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
                this.query.protectionPost(112, { param: [id] }, (data) => 
                { 
                    this.query.protectionPost(254, { param: [id] }, (data) => 
                    {
                        update();
                    });
                });
        });
    }
}
