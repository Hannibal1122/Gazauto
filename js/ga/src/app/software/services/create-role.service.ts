import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class CreateRoleService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(parentId, update, data)
    {
        this.loadRoleAndUser((users, roles) =>
        {
            var Data:any = {
                title: "<b>" + (data ? "Изменение" : "Создание") + " роли</b>",  
                data: [["Роль", "", "text"]],
                ok: data ? "Изменить" : "Создать",
                cancel: "Отмена"
            };
            if(data)
                Data.data[0][1] = data.name;
            this.modal.open(Data, (save)=>
            {
                if(save)
                {
                    if(this.modal.Data[0][1] == "") return "Введите название!";
                    data ? this.query.protectionPost(155, { param: [ this.modal.Data[0][1], data.name ] }, (data) =>
                        {
                            update();
                        }) :
                            this.query.protectionPost(153, { param: [ this.modal.Data[0][1], parentId ] }, (data) =>
                            {
                                update();
                            });
                }
            });
        });
    }
    remove(name, update)
    {
        var Data:any = {
            title: "Вы действительно хотите удалить элемент? (" + name + ")",  
            data: [],
            ok: "Да",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save) =>
        {
            if(save)
                this.query.protectionPost(157, { param: [name] }, (data) => 
                { 
                    update();
                });
        });
    }
    loadRoleAndUser(func)
    {
        var users = {};
        var roles = [];
        this.query.protectionPost(150, { param: [] }, (data) =>
        {
            for(var i = 0; i < data.length; i++) users[data[i][0]] = data[i][1];
            this.query.protectionPost(151, { param: [] }, (data) =>
            {
                for(var i = 0; i < data.length; i++) roles[i] = data[i][0];
                if(func) func(users, roles);
            });
        });
    }
}
