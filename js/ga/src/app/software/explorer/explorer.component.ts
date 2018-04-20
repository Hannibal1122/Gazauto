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
    currentPath:any = { name: "Root", id: -1 };
    level = 0;
    folders = [];
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
        this.query.protectionPost(110, { param: [] }, (data) => 
        { 
            this.folders = this.translate(data);
            trace(this.folders);
            this.openFolder(-1);
        });
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
                    let id = this.currentPath.id == -1 ? 0 : this.currentPath.id;
                    this.createObject(id, type, null, null);
                }]
            ],
            ok: "",
            cancel: "Отмена"
        };
        this.modal.open(Data);
    }
    createObject(id, type, objectType, data)
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
                this.createRight.create(id, objectType, () => { this.update() });
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
    selectObject(i) // Выделить объект
    {
        this.selectObjectI = i;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        this.query.protectionPost(202, { param: [ id, objectType ] }, (data) =>
        {
            let right = this.createRight.decodeRights(data[0]);
            trace(right)
            /* this.selectRules.new = Boolean(right.copy); */
            this.selectRules.copy = Boolean(right.copy);
            /* this.selectRules.paste = true; */
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = Boolean(right.change);
            this.selectRules.remove = Boolean(right.change);

            /* new: true, 
            copy: false, 
            paste: false, 
            cut: false, 
            rights: false, 
            remove: false */
        });
    }
    unSelectObject() // отпустить объект
    {
        this.selectObjectI = -1;
        this.selectRules.copy = false;
        this.selectRules.cut = false;
        this.selectRules.rights = false;
        this.selectRules.remove = false;
    }
    openFolder(parent) // открыть папку
    {
        if(parent == undefined) return;
        this.currentPath = { name: "Root", id: -1 };
        this.outFolders = [];
        for(var i = 0; i < this.folders.length; i++)
            if(this.folders[i].parent == parent) 
                this.outFolders.push(this.folders[i]);
            else if(this.folders[i].id == parent)
                this.currentPath = this.folders[i];
        this.updatePath(parent);
        this.unSelectObject();
    }
    updatePath(parent) // Получение полного пути
    {
        this.allPath = [];
        this.getNameByParent(parent);
        this.allPath.push({ name: "Root", id: -1 });
        this.allPath.reverse();
    }
    getNameByParent(parent) // Получение полного пути
    {
        for(var i = 0; i < this.folders.length; i++)
            if(this.folders[i].id == parent)  
            {
                this.allPath.push({ name: this.folders[i].name, id: this.folders[i].id });
                this.getNameByParent(this.folders[i].parent)
                break;
            }
    }
    update()
    {
        this.query.protectionPost(110, { param: [] }, (data) => 
        { 
            this.folders = this.translate(data);
            this.openFolder(this.currentPath.id);
        });
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