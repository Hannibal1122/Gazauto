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
            data: [["", "" , "textarea"], 
                ["Приоритет", 0, "text"],
                ["Показывать статус", false, "checkbox"],
                ["Показывать кол-во", false, "checkbox"],
                ],
            ok: "Сохранить",
            cancel: "Отмена"
        };
        this.query.protectionPost(115, { param: [id] }, (priorityAndIcon) =>
        {
            let icon = 
            {
                state: (priorityAndIcon[0][1] & 1) == 1,
                count: (priorityAndIcon[0][1] & 2) == 2
            }
            Data.data[1][1] = priorityAndIcon[0][0];
            Data.data[2][1] = icon.state;
            Data.data[3][1] = icon.count;
            this.query.protectionPost(122, { param: [id] }, (data) => 
            {
                Data.data[0][1] = data[0][0];
                this.modal.open(Data, (save)=>
                {
                    if(save)
                        this.query.protectionPost(123, { param: [ id, Data.data[0][1] ] }, () => 
                        {
                            let icon = 12 | (Data.data[2][1]) | (Data.data[3][1] << 1)
                            this.query.protectionPost(116, { param: [ Data.data[1][1], icon, id ] }, () => { update(); });
                        });
                });
            });
        });
    }
}