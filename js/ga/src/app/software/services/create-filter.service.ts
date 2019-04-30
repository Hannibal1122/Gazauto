import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateFilterService
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(id, update)
    {
        let Data:any = {
            title: "<b>Создать фильтр</b>",  
            data: [
                ["Имя", "", "text"], 
                ["Фильтр", null, "filterEditor"]],
            ok: "Создать",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                this.query.protectionPost(470, { param: [id, Data.data[1][1]] }, (data) => 
                {
                    this.query.protectionPost(100, { param: ["filter", data[0], Data.data[0][1], id, 0, ""] }, (data) => 
                    { 
                        update();
                    });
                });
            }
        });
    }
    update(id, parentId, name)
    {
        this.query.protectionPost(253, { param: [ parentId ] }, (head) => 
        {
            let fields = [];
            for(let i = 0; i < head.length; i++) fields.push({ id: head[i][0], value: head[i][1] });
            this.query.protectionPost(472, { param: [ id ] }, (data) => 
            {
                trace(data)
                let Data:any = {
                    title: "<b>Изменить фильтр</b>",  
                    data: [
                        ["Имя", name, "html"], 
                        ["Фильтр", { fields: fields, expression: data[0][0] }, "filterEditor"]],
                    ok: "Сохранить",
                    cancel: "Отмена"
                };
                this.modal.open(Data, (save)=>
                {
                    if(save) this.query.protectionPost(471, { param: [id, Data.data[1][1]] }, null);
                });
            });
        });
    }
    remove(id, update)
    {
        
    }
}
