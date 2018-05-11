import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { CreateTableService } from "../create-table.service";
import { CreateUserService } from "../create-user.service";
import { CreateRoleService } from "../create-role.service";
import { CreateFolderService } from "../create-folder.service";
import { CreateRightService } from "../create-right.service";
import { CreateValueService } from "../create-value.service";
import { PasteObjectService } from "../paste-object.service";

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
        CreateValueService,
        PasteObjectService
    ]
})
export class ExplorerComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;
    onChange = null;
    inputs = 
    {
        data: null
    };
    allPath = [];
    parent = 0;
    outFolders = [];
    selectObjectI = -1;
    load = false;
    selectObjectCopy = { id: -1, type: "" };
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
        private createValue: CreateValueService,
        private pasteObject: PasteObjectService,
    ) {}
    ngOnInit() 
    { 
        if(this.inputs.data && this.inputs.data.id) 
        {
            this.openFolder(this.inputs.data.id, this.inputs.data.element ? () => 
            {
                let i = 0;
                for(; i < this.outFolders.length; i++)
                    if(this.inputs.data.element == this.outFolders[i].id)
                    {
                        this.openObject(this.outFolders[i]);
                        break;
                    }
            } : null);
        }
        else this.openFolder(0);
        this.createTable.modal = this.modal;
        this.createUser.modal = this.modal;
        this.createRole.modal = this.modal;
        this.createFolder.modal = this.modal;
        this.createRight.modal = this.modal;
        this.createValue.modal = this.modal;
        this.pasteObject.modal = this.modal;
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
    openObject(object)
    {
        switch(object.objectType)
        {
            case "folder": 
                this.openFolder(object.id);
                break;
            case "table":
                this.onChange({ type: "open", value: { name: "table", id: object.id }});
                break;
            case "user":
                this.createObject(null, 'Пользователь', object);
                break;
            case "role":
                this.createObject(null, 'Роль', object)
                break;
            case "value":
                this.createObject(null, 'Значение', object)
                break;
        }
    }
    createObject(id, type, data)
    {
        switch(type)
        {
            case "Папка": 
                this.createFolder.create(id, () => { this.refresh() });
                break;
            case "Таблица": 
                this.createTable.create(id, () => { this.refresh() });
                break;
            case "Значение":
                this.createValue.create(id, () => { this.refresh() }, data);
                break;
            case "Событие": break;
            case "Права": 
                this.createRight.create(id, () => { this.refresh() });
                break;
            case "Пользователь":
                this.createUser.create(() => { this.refresh() }, data);
                break;
            case "Роль": 
                this.createRole.create(() => { this.refresh() }, data);
                break;
        }
    }
    copyObject(copyOrCut)
    {
        localStorage.setItem("copyExplorer", JSON.stringify(this.outFolders[this.selectObjectI]));
        localStorage.setItem("lastOperationExplorer", copyOrCut);
        this.refresh();
    }
    _pasteObject()
    {
        this.pasteObject.paste(this.parent, () => { this.refresh() })
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
                this.createFolder.remove(id, () => { this.refresh() });
                break;
            case "table":
                this.createTable.remove(id, () => { this.refresh() });
                break;
            case "user":
                this.createUser.remove(name, () => { this.refresh() });
                break;
            case "role": 
                this.createRole.remove(name, () => { this.refresh() });
                break;
            case "value": 
                this.createValue.remove(id, () => { this.refresh() });
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
        this.query.protectionPost(202, { param: [ id ] }, (data) =>
        {
            this.clearRules(false);
            let right = this.createRight.decodeRights(data[0]);
            this.selectRules.copy = Boolean(right.copy);
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = Boolean(right.change);
            this.selectRules.remove = Boolean(right.change);
            this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
        });
    }
    unSelectObject() // отпустить объект
    {
        this.selectObjectCopy = { id: -1, type: "" };
        this.selectObjectI = -1;
        this.clearRules(true);
    }
    openFolder(id, func?) // открыть папку
    {
        this.openStructure(id, () =>
        {
            this.unSelectObject();
            this.query.protectionPost(202, { param: [ id ] }, (data) =>
            {
                if(localStorage.getItem("copyExplorer") != null)
                {
                    this.selectObjectCopy.id = JSON.parse(localStorage.getItem("copyExplorer")).id;
                    this.selectObjectCopy.type = localStorage.getItem("lastOperationExplorer");
                }

                this.clearRules(true);
                let right = this.createRight.decodeRights(data[0]);
                this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
                this.selectRules.new = Boolean(right.change);
                if(func) func();
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
        this.load = true;
        this.query.protectionPost(110, { param: [parent] }, (data) => 
        { 
            this.outFolders = data.folder;
            this.allPath = data.path;
            this.allPath.push({id: 0, name: "Root"});
            this.allPath.reverse();
            if(func) func();
            this.parent = parent;
            this.load = false;
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
    refresh(clearCopy?)
    {
        if(clearCopy) localStorage.removeItem("copyExplorer");
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