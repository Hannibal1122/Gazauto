import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { CreateTableService } from "../create-table.service";
import { CreateUserService } from "../create-user.service";
import { CreateRoleService } from "../create-role.service";
import { CreateFolderService } from "../create-folder.service";
import { CreateRightService } from "../create-right.service";

declare var trace:any;
@Component({
    selector: 'app-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.css'],
    providers: [
        QueryService, 
        CreateTableService,
        CreateUserService,
        CreateRoleService,
        CreateFolderService,
        CreateRightService,
    ]
})
export class ExplorerComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;

    inputs = {};
    allPath = [];
    parent = 0;
    level = 0;
    outFolders = [];
    selectObjectI = -1;
    selectRules = 
    {
        new: true, 
        copy: false, 
        paste: false, 
        cut: false, 
        rights: false, 
        remove: false
    }
    constructor(
        private injector: Injector, 
        private query: QueryService, 
        private createTable: CreateTableService,
        private createUser: CreateUserService,
        private createRole: CreateRoleService,
        private createFolder: CreateFolderService,
        private createRight: CreateRightService,
    ) 
    { 
        this.openStructure(0, null);
    }
    ngOnInit() 
    { 
        this.createTable.modal = this.modal;
        this.createUser.modal = this.modal;
        this.createRole.modal = this.modal;
        this.createFolder.modal = this.modal;
        this.createRight.modal = this.modal;
    }
    newObject() // Создание объекта
    {
        var Data:any = {
            title: "Выберите тип",  
            data: [
                ["", -1, "typeObject", (type) => 
                {
                    trace(type)
                    this.modal.close(false);
                    let id = this.parent;
                    this.createObject(id, type, null);
                }]
            ],
            ok: "",
            cancel: "Отмена"
        };
        this.modal.open(Data);
    }
    createObject(id, type, data)
    {
        switch(type)
        {
            case "Папка": 
                this.createFolder.create(id, () => { this.update() });
                break;
            case "Таблица": 
                this.createTable.create(id, () => { this.update() });
                break;
            case "Значение": break;
            case "Событие": break;
            case "Права": 
                this.createRight.create(id, () => { this.update() });
                break;
            case "Пользователь":
                this.createUser.create(() => { this.update() }, data);
                break;
            case "Роль": 
                this.createRole.create(() => { this.update() }, data);
                break;
        }
    }
    removeObject() // Удалить объект
    {
        if(this.selectObjectI == -1) return;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        var name = this.outFolders[this.selectObjectI].name;
        switch(objectType)
        {
            case "folder":
                this.createFolder.remove(id, () => { this.update() });
                break;
            case "table":
                this.createTable.remove(id, () => { this.update() });
                break;
            case "user":
                this.createUser.remove(name, () => { this.update() });
                break;
            case "role": 
                this.createRole.remove(name, () => { this.update() });
                break;
        }
    }
    clickTimeout = null;

    selectObject(i) // Выделить объект
    {
        this.selectObjectI = i;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        var parent = this.outFolders[this.selectObjectI].parent;
        
        this.clearRules(false);
        this.query.protectionPost(202, { param: [ id ] }, (data) =>
        {
            let right = this.createRight.decodeRights(data[0]);
            this.selectRules.copy = Boolean(right.copy);
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = Boolean(right.change);
            this.selectRules.remove = Boolean(right.change);
        });
    }
    unSelectObject() // отпустить объект
    {
        this.selectObjectI = -1;
        this.clearRules(true);
    }
    openFolder(id) // открыть папку
    {
        this.openStructure(id, () =>
        {
            this.unSelectObject();
            this.query.protectionPost(202, { param: [ id ] }, (data) =>
            {
                trace(data)
                this.clearRules(true);
                let right = this.createRight.decodeRights(data[0]);
                /* this.selectRules.paste = true; */
                this.selectRules.new = Boolean(right.change);
            });
        });
    }
    openBackFolder()
    {
        this.query.protectionPost(111, { param: [ this.parent ] }, (data) =>
        {
            if(data.length > 0)
            this.openFolder(data[0][0]);
        });
    }
    openStructure(parent, func)
    {
        this.query.protectionPost(110, { param: [parent] }, (data) => 
        { 
            this.outFolders = data;
            if(func) func();
            this.parent = parent;
        });
    }
    clearRules(_new)
    {
        this.selectRules = 
        {
            new: _new ? false : this.selectRules.new, 
            copy: false, 
            paste: false, 
            cut: false, 
            rights: false, 
            remove: false
        }
    }
    update()
    {
        this.openFolder(this.parent);
    }
    translate(data) // Нужно для уменьшения объема сообщения от сервера
    {
        let out = [];
        for(var i = 0; i < data.length; i++)
        {
            out[i] = {};
            out[i]["id"] = data[i]["id"];
            out[i]["name"] = data[i]["n"];
            out[i]["objectType"] = data[i]["ot"];
            out[i]["parent"] = data[i]["p"];
        }
        return out;
    }
}