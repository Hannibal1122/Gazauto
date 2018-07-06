import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
declare var trace:any;
@Injectable()
export class RenameObjectService
{
    Data:any = {
        title: "Переименовать объект",  
        data: [ ["Имя", "", "text"] ],
        ok: "Переименовать",
        cancel: "Отмена"
    };

    constructor(public query: QueryService) 
    { 
    }
    modal;
    rename(id, oldName, update)
    {
        this.Data.data[0][1] = oldName;
        this.modal.open(this.Data, (save) =>
        {
            if(save)
            {
                if(this.Data.data[0][1] == "") return "Введите имя!";  
                this.query.protectionPost(120, { param: [id, this.Data.data[0][1]] }, (data) => 
                { 
                    update();
                });
            }
        });
    }
}
