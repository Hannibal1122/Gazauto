import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateClassService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(_idParent, update)
    {
        let idParent = _idParent;
        var Data:any = {
            title: "<b>Добавление класса</b>",  
            data: [["Название", "", "text"]],
            ok: "Добавить",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                this.query.protectionPost(100, { param: ["class", "NULL", Data.data[0][1], idParent, 0, ""] }, (data) => 
                {  
                    if(data[0] == "Index")
                        this.query.protectionPost(490, { param: [idParent, data[1] ] }, (data) => 
                        {  
                            update();
                        });
                });
            }
        });
    }
    remove(id, update)
    {
        this.query.getWhereUsed(id, (data) => 
        {
            var Data:any = {
                title: "Вы действительно хотите удалить элемент? (" + id + ")",  
                data: [],
                ok: "Да",
                cancel: "Отмена"
            };
            if(data != "") Data.data[0] = ["", data, "html"];
            this.modal.open(Data, (save) =>
            {
                if(save)
                    this.query.protectionPost(112, { param: [id] }, (data) => 
                    { 
                        update();
                    });
            });
        });
    }
}
