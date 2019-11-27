import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateClassObjectService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(_idParent, update, data)
    {
        let idParent = _idParent;
        var Data:any = {
            title: "<b>Создание объекта класса</b> " + data.name,  
            data: [["Название", "", "text"]],
            ok: "Создать",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                this.query.protectionPost(493, { param: [idParent, data.id, Data.data[0][1], "class"] }, (id) => 
                {
                    update({ id: id });
                });
            }
        });
    }
}
