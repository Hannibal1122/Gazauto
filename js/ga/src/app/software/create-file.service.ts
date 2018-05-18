import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateFileService
{
    Data:any = {
        title: "Создание файла",  
        data: [
            ["Файл", [], "uploader", 117, 118, 1]
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
        this.modal.open(this.Data, (save) =>
        {
            if(save)
            {
                if(this.Data.data[0][1].length == 0) return "Добавьте файл!";  
                this.query.protectionPost(100, { param: ["file", "NULL", this.Data.data[0][1][0].fullName, id, 0, ""] }, (data) => 
                { 
                    /* update()  */
                    this.query.protectionPost(119, { param: [data[1], this.Data.data[0][1][0].fullName] }, (data) => 
                    { 
                        this.modal.close(false);
                        update();
                    });
                });
                /* this.query.protectionPost(114, { param: JSON.stringify([this.Data.data[0][1][0].fullName, this.templates, this.header, this.IdTable]) }, (data) =>
                {
                    trace(data)
                    if(data[0] == "ERROR") this.modal.error = data[1];
                    else if(data[0] == "OK") 
                    {
                        this.modal.close(false);
                        this.LoadTable();
                    }
                });   */      
                return "Загрузка";
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
                this.query.protectionPost(120, { param: [id] }, (data) => 
                { 
                    this.query.protectionPost(112, { param: [id] }, (data) => 
                    {
                        update();
                    });
                });
        });
    }
}
