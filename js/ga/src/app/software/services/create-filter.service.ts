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
        this.query.protectionPost(253, { param: [ id ] }, (head) => 
        {
            let fields = [];
            let column = [];
            for(let i = 0; i < head.length; i++) 
            {
                fields.push({ id: head[i][0], value: head[i][1] });
                column.push({ id: head[i][0], value: head[i][1], check: true });
            }
            let Data:any = {
                title: "<b>Создание фильтра</b>",  
                data: [
                    ["Имя", "", "text"], 
                    ["Фильтр", { fields: fields }, "filterEditor"],
                    ["Столбцы", column, "multi-checkbox"]],
                ok: "Создать",
                cancel: "Отмена"
            };
            this.modal.open(Data, (save)=>
            {
                if(save)
                {
                    if(Data.data[0][1] == "") return "Введите имя!";
                    this.query.protectionPost(470, { param: [id, Data.data[1][1], JSON.stringify(Data.data[2][1]) ] }, (data) => 
                    {
                        this.query.protectionPost(100, { param: ["filter", data[0], Data.data[0][1], id, 0, ""] }, (data) => 
                        { 
                            update();
                        });
                    });
                }
            });
        });
    }
    update(id, parentId, name)
    {
        this.query.protectionPost(253, { param: [ parentId ] }, (head) => 
        {
            let fields = [];
            let column = [];
            let columnMap = {}; // Для быстрого заполнения, чтобы не делать двойную проверку
            for(let i = 0; i < head.length; i++) 
            {
                fields[i] = { id: head[i][0], value: head[i][1] };
                column[i] = { id: head[i][0], value: head[i][1], check: true };
                columnMap[column[i].id] = i;
            }
            this.query.protectionPost(472, { param: [ id ] }, (data) => 
            {
                if(data[0][1])
                {
                    let filterColumn = JSON.parse(data[0][1]);
                    for(let i = 0; i < filterColumn.length; i++)
                    {
                        let id = filterColumn[i].id;
                        if(columnMap[id] === undefined) continue;
                        column[columnMap[id]].check = filterColumn[i].check;
                    }
                }
                let Data:any = {
                    title: "<b>Изменить фильтр</b>",  
                    data: [
                        ["Имя", name, "html"], 
                        ["Фильтр", { fields: fields, expression: data[0][0] }, "filterEditor"],
                        ["Столбцы", column, "multi-checkbox"]],
                    ok: "Сохранить",
                    cancel: "Отмена"
                };
                this.modal.open(Data, (save)=>
                {
                    if(save) this.query.protectionPost(471, { param: [ id, Data.data[1][1], JSON.stringify(Data.data[2][1]) ] }, null);
                });
            });
        });
    }
    remove(id, update)
    {
        
    }
}
