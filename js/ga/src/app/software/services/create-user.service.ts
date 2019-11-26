import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
declare var md5:any;

@Injectable()
export class CreateUserService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(parentId, update, data)
    {
        this.loadRoleAndUser((users, roles) =>
        {
            let _new = true;
            var Data:any = {
                title: "<b>" + (data ? "Изменение" : "Создание") + " пользователя</b>",  
                data: [
                    ["Логин", "", data ? "html" : "text"], 
                    ["Роль", {selected: roles[0], data: roles}, "select"], 
                    ["Пароль", "", "password"]],
                ok: data ? "Изменить" : "Создать",
                cancel: "Отмена"
            };
            if(data)
            {
                _new = false;
                Data.data[0][1] = data.name;
                Data.data[1][1].selected = users[data.name];
            }
            this.modal.open(Data, (save)=>
            {
                if(save)
                {
                    if(this.modal.Data[0][1] == "") return "Введите логин!";
                    if(this.modal.Data[2][1] == "" && _new) return "Введите пароль!";
                    var param = [this.modal.Data[0][1], this.modal.Data[1][1].selected, this.modal.Data[2][1] == "" ? "" : md5(this.modal.Data[2][1]), parentId];
                    data ? this.query.protectionPost(154, { param: param }, (data) =>
                            {
                                update();
                            }) :
                                this.query.protectionPost(152, { param: param }, (data) =>
                                {
                                    update();
                                });
                }
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
                this.query.protectionPost(156, { param: [name] }, (data) => 
                { 
                    update();
                });
        });
    }
}
