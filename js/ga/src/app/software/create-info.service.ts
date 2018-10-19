import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
declare var trace:any;

@Injectable()
export class CreateInfoService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(id, update)
    {
        var Data:any = {
            title: "<b>Информация</b>",  
            data: [["", "" , "textarea"], 
                ["Приоритет", 0, "text"]],
            ok: "Сохранить",
            cancel: "Отмена"
        };
        this.query.protectionPost(115, { param: [id] }, (priority) =>
        {
            Data.data[1][1] = priority[0][0];
            this.query.protectionPost(122, { param: [id] }, (data) => 
            {
                Data.data[0][1] = data[0][0];
                this.query.protectionPost(457, { param: [id] }, (data) => 
                {
                    for(var key in data) Data.data.push([key, data[key], "checkbox"])
                    this.modal.open(Data, (save)=>
                    {
                        if(save)
                        {
                            this.query.protectionPost(123, { param: [ id, Data.data[0][1] ] }, () => 
                            {
                                this.query.protectionPost(116, { param: [ Data.data[1][1], id ] }, () => { update(); });
                            });
                            for(var i = 2; i < Data.data.length; i++)
                            {
                                let query = 456;
                                if(Data.data[i][1]) query = 455;
                                this.query.protectionPost(query, { param: [ Data.data[i][0], id ] }, () => { });
                            }
                        }
                    });
                });
            });
        });
    }
}