import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
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
            data: [["", "" , "textarea"]],
            ok: "Сохранить",
            cancel: "Отмена"
        };
        this.query.protectionPost(122, { param: [id] }, (data) => 
        {
            Data.data[0][1] = data[0][0];
            this.modal.open(Data, (save)=>
            {
                if(save)
                    this.query.protectionPost(123, { param: [ id, Data.data[0][1] ] }, () => { update(); });
            });
        });
    }
}