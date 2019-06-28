import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;

@Injectable()
export class CreateRightService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(id, update)
    {
        this.loadRoleAndUser((users, roles) =>
        {
            var data = [];
            var Data:any = {
                title: "<b>Редактор прав</b>",  
                data: [
                    ["Пользователь", {selected: users[0], data: users}, "selectAndButton", null, 
                        () => 
                        {
                            if(this.checkRepeat(Data.data[2][3], Data.data[0][1].selected, "user"))
                                Data.data[2][3].push({ 
                                    login: Data.data[0][1].selected,
                                    type: "user",
                                    view: false,
                                    copy: false,
                                    link: false,
                                    change: false 
                                });
                        } // Добавить в список пользователя
                    ], 
                    ["Роль", {selected: roles[0], data: roles}, "selectAndButton", null, 
                        () => 
                        {
                            if(this.checkRepeat(Data.data[2][3], Data.data[1][1].selected, "role"))
                                Data.data[2][3].push({
                                    login: Data.data[1][1].selected,
                                    type: "role",
                                    view: false,
                                    copy: false,
                                    link: false,
                                    change: false 
                                });
                        } // Добавить в список пользователя
                    ], 
                    ["Права", -1, "rightObject", []],
                    ["ко всем потомкам", false, "checkbox"]
                ],
                ok: "Сохранить",
                cancel: "Отмена"
            };
            this.query.protectionPost(201, { param: [ id ] }, (data) =>
            {
                for(var i = 0; i < data.length; i++)
                {
                    let rights = this.decodeRights(data[i].rights);
                    data[i].view = rights.view;
                    data[i].copy = rights.copy;
                    data[i].link = rights.link;
                    data[i].change = rights.change;
                }
                Data.data[2][3] = data;
                this.modal.open(Data, (save)=>
                {
                    if(save)
                    {
                        for(var i = 0; i < Data.data[2][3].length; i++)
                            Data.data[2][3][i].rights = this.encodeRights(Data.data[2][3][i].view, Data.data[2][3][i].copy, Data.data[2][3][i].link, Data.data[2][3][i].change);
                        var param = [id, JSON.stringify(Data.data[2][3]), Data.data[3][1]];
                        this.query.protectionPost(200, { param: param }, () => { });
                    }
                });
            });
        });
    }
    encodeRights(view, copy, link, change) // декодировать
    {
        var out = 0;
        out = out | (Number(change) << 3);
        out = out | (Number(link) << 2);
        out = out | (Number(copy) << 1);
        out = out | Number(view);
        return out;
    }
    decodeRights(rights) // раскодировать
    {
        var out:any = { };
        out.view = rights & 1;
        out.copy = (rights & 2) >> 1;
        out.link = (rights & 4) >> 2;
        out.change = (rights & 8) >> 3;
        return out;
    }
    checkRepeat(array, login, type)
    {
        for(var i = 0; i < array.length; i++)
            if(array[i].login == login && array[i].type == type) return false;
        return true;
    }
    loadRoleAndUser(func)
    {
        var users = [];
        var roles = [];
        this.query.protectionPost(150, { param: [] }, (data) =>
        {
            for(var i = 0; i < data.length; i++) users[i] = data[i][0];
            this.query.protectionPost(151, { param: [] }, (data) =>
            {
                for(var i = 0; i < data.length; i++) roles[i] = data[i][0];
                if(func) func(users, roles);
            });
        });
    }
}
