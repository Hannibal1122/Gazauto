import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class CreatePlanChartService
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(_idParent, update)
    {
        let idParent = _idParent;
        let Data:any = {
            title: "<b>Создать план-график</b>",  
            data: [
                ["Имя", "", "text"], 
                ["Месяц, год", null, "datetime", null, { time: false, day: false }]],
            ok: "Создать",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save)=>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                let date = new Date(Data.data[1][1]);
                this.query.protectionPost(100, { param: ["plan", "NULL", Data.data[0][1], idParent, 0, ""] }, (data) => 
                {  
                    if(data[0] == "Index")
                        this.query.protectionPost(400, { param: [data[1], date.getMonth() + 1, date.getFullYear()] }, (data) => 
                        {  
                            update();
                        });
                });
            }
        });
    }
    update(id, parentId, name)
    {
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
                        trace(data)
                        /* this.query.protectionPost(254, { param: [id] }, (data) => 
                        { */
                            update();
                        /* }); */
                    });
            });
        });
    }
}
