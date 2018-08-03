import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { CreateTableService } from "../create-table.service";
import { CreateUserService } from "../create-user.service";
import { CreateRoleService } from "../create-role.service";
import { CreateFolderService } from "../create-folder.service";
import { CreateRightService } from "../create-right.service";
import { CreateValueService } from "../create-value.service";
import { PasteObjectService } from "../paste-object.service";
import { CreateFileService } from "../create-file.service";
import { CreateInfoService } from "../create-info.service";
import { RenameObjectService } from "../rename-object.service";
import { CreateEventService } from "../create-event.service";
import { CreateTableListService } from "../create-table-list.service";

declare var $:any;
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
        PasteObjectService,
        CreateFileService,
        CreateInfoService,
        RenameObjectService,
        CreateTableListService,
        CreateEventService
    ]
})
export class ExplorerComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;
    set inputFromApp(value)
    {
        if(value) 
            if(value.search) this.openObjectById("search", value.search);
            else if(value.element) this.openObjectById("element", value.element);
    }
    onChange = null;
    inputs = { id: -1, element: null, searchObjectId: null };
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
        remove: false,
        download: false,
        info: false,
        rename: false
    }
    viewType = "table"; // Вид просмотра
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
        private createFile: CreateFileService,
        private createInfo: CreateInfoService,
        private renameObject: RenameObjectService,
        private createEvent: CreateEventService,
        private createTableList: CreateTableListService,
    ) {}
    ngOnInit() 
    { 
        /* trace(this.inputs.data) */
        if(this.inputs && this.inputs.id) 
        {
            this.openFolder(this.inputs.id, () => 
            {
                let id = -1;
                let type = "";
                if(this.inputs.element) { id = this.inputs.element; type = "element"; }
                if(this.inputs.searchObjectId) { id = this.inputs.searchObjectId; type = "search"; }
                this.openObjectById(type, id);
            });
        }
        else this.openFolder(0);
        this.createTable.modal = this.modal;
        this.createUser.modal = this.modal;
        this.createRole.modal = this.modal;
        this.createFolder.modal = this.modal;
        this.createRight.modal = this.modal;
        this.createValue.modal = this.modal;
        this.pasteObject.modal = this.modal;
        this.createFile.modal = this.modal;
        this.createInfo.modal = this.modal;
        this.renameObject.modal = this.modal;
        this.createEvent.modal = this.modal;
        this.createTableList.modal = this.modal;
        this.globalClick = (e) => 
        { 
            if(e.target.className == "col-md-12" && this.selectObjectI != -1) this.refresh(); 
            this.createContextMenu.visible = false;
        }
        window.addEventListener("click", this.globalClick, false);
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
    }
    changeViewType()
    {
        if(this.viewType == "list") this.viewType = "table";
        else this.viewType = "list";
    }
    openObjectById(type, id)
    {
        let i = 0;
        for(; i < this.outFolders.length; i++)
            if(id == this.outFolders[i].id) break;
        if(type == "element") this.openObject(this.outFolders[i]);
        else if(type == "search") this.searchObject(i);
    }
    newObject() // Создание объекта
    {
        var Data:any = {
            title: "Выберите тип",  
            data: [
                ["", -1, "typeObject", (type) => 
                {
                    /* trace(type) */
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
    openObject(object) // Открыть объект
    {
        switch(object.objectType)
        {
            case "folder": 
                this.openFolder(object.id);
                break;
            case "table":
                this.onChange({ type: "open", value: { name: "table", id: object.id }});
                break;
            case "event":
                this.onChange({ type: "open", value: { name: "event", id: object.id }});
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
            case "tlist":
                this.query.protectionPost(307, { param: [ object.id ] }, (data) => 
                {
                    this.createTableList.create(null, () => { this.refresh() }, data[3], { id: object.id, fieldId: Number(data[2]), name: object.name });
                });
                break;
        }
    }
    createObject(id, type, data) // Создать объект
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
            case "Событие": 
                this.createEvent.create(id, () => { this.refresh() });
                break;
            case "Права": 
                this.createRight.create(id, () => { this.refresh() });
                break;
            case "Пользователь":
                this.createUser.create(id, () => { this.refresh() }, data);
                break;
            case "Роль": 
                this.createRole.create(id, () => { this.refresh() }, data);
                break;
            case "Файл": 
                this.createFile.create(id, () => { this.refresh() });
                break;
        }
    }
    copyObject(copyOrCut) // Копировать/вырезать объект
    {
        localStorage.setItem("copyExplorer", JSON.stringify(this.outFolders[this.selectObjectI]));
        localStorage.setItem("lastOperationExplorer", copyOrCut);
        this.refresh();
    }
    downloadObject() // Загрузить объект
    {
        var elem = this.outFolders[this.selectObjectI];
        var iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.setAttribute("src", this.query.protectionGet(121, elem.id));
        document.body.appendChild(iframe);
        iframe.onload = () => { document.body.removeChild(iframe); } // надо удалять!!!
        /* document.body.appendChild(iframe); */
    }
    getRenameObject() // Переименовать объект
    {
        if(this.selectObjectI == -1) return;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        var name = this.outFolders[this.selectObjectI].name;
        this.renameObject.rename(id, name, () => { this.refresh() });
    }
    _pasteObject()
    {
        this.load = true;
        this.pasteObject.paste(this.parent, () => { this.refresh() }, () => { this.load = false; })
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
            case "event": 
                this.createEvent.remove(id, () => { this.refresh() });
                break;
            case "file": 
                this.createFile.remove(id, () => { this.refresh() });
                break;
            case "tlist":
                this.createTableList.remove(id, () => { this.refresh() });
                break;
        }
    }
    searchObjectI = -1;
    searchTimeout = null
    searchObject(i) // Выделяет объект зеленой границей
    {
        clearInterval(this.searchTimeout);
        this.searchObjectI = i;
        let searchObjectI = this.searchObjectI;
        let searchObjectCount = 0;
        this.searchTimeout = setInterval(() => 
        { 
            if(searchObjectCount % 2 == 0) this.searchObjectI = -1;
            else this.searchObjectI = searchObjectI; 
            if(searchObjectCount++ > 10) 
            {
                clearInterval(this.searchTimeout);
                this.searchObjectI = -1;
            }
        }, 500);
    }
    clickTimeout = null;
    selectObject(i) // Выделить объект
    {
        this.selectObjectI = i;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        this.query.protectionPost(202, { param: [ id ] }, (data) =>
        {
            this.clearRules(false);
            let right = this.createRight.decodeRights(data[0]);
            this.selectRules.copy = objectType == "user" || objectType == "role" || objectType == "tlist" ? false : Boolean(right.copy);
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = objectType == "user" || objectType == "role" ? false : Boolean(right.change);
            this.selectRules.remove = Boolean(right.change);
            this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
            this.selectRules.info = Boolean(right.change);
            this.selectRules.rename = Boolean(right.change) && objectType != "user" && objectType != "role" && objectType != "file";
            if(objectType == "file") this.selectRules.download = true;
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

                let right = this.createRight.decodeRights(data[0]);
                this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
                this.selectRules.new = Boolean(right.change);
                if(func) func();
                this.inputs.id = id;
            });
        });
    }
    addInfo() // Добавить справку
    {
        if(this.selectObjectI != -1)
            this.createInfo.create(this.outFolders[this.selectObjectI].id, () => { this.refresh(); });
    }
    openBackFolder()
    {
        this.query.protectionPost(111, { param: [ "folder", this.parent ] }, (data) =>
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
            this.searchInput = "";
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
            remove: false,
            download: false,
            info: false,
            rename: false
        }
    }
    refresh(clearCopy?)
    {
        if(clearCopy) localStorage.removeItem("copyExplorer");
        this.openFolder(this.parent);
    }
    searchInput = "";
    searchInputType = "";
    searchInputObject() // Глобальный поиск
    {
        if(this.searchInput == "") return;
        this.load = true;
        this.unSelectObject();
        this.query.protectionPost(124, { param: ["%" + this.searchInput + "%", "%" + this.searchInputType + "%"] }, (data) =>
        {
            this.outFolders = data.folder;
            this.load = false;
        });
    }
    searchInputObjectFromFolder() // Поиск в папке
    {
        if(this.searchInput == "") return;
        let searchInput = this.searchInput.toLowerCase();
        for(var i = 0; i < this.outFolders.length; i++)
            if(this.outFolders[i].name.toLowerCase().indexOf(searchInput) != -1) this.outFolders[i].visible = true;
            else this.outFolders[i].visible = false;
    }
    clearSearch()
    {
        if(this.searchInput == "") this.refresh();
    }
    globalClick = null;
    /**************************************/
    listLink = 
    {
        visible: false,
        fromInherit: [], // От кого наследует
        whoInherit: [], // Кто наследует
        whoRefer: [] // Кто ссылается
    }
    getListLink()
    {
        if(this.selectObjectI == -1) return;
        this.query.protectionPost(125, { param: [ this.outFolders[this.selectObjectI].id ]}, (data) =>
        {
            trace(data)
            this.listLink.fromInherit = data.fromInherit;
            this.listLink.whoInherit = data.whoInherit;
            this.listLink.whoRefer = [];
            for(var key in data.whoRefer)
                this.listLink.whoRefer.push({
                    id: key, 
                    fields: data.whoRefer[key].fields, 
                    name: data.whoRefer[key].name
                });
            this.listLink.visible = true;
        });
    }
    closeListLink()
    {
        this.listLink.visible = false;
    }
    openTable(id)
    {
        this.onChange({ type: "openFromTable", value: { name: "table", id: id }});
    }
    openField(id, tableId)
    {
        this.onChange({ type: "openFromTable", value: { name: "cell", id: id }});
    }
    createListOfTable()
    {
        if(this.selectObjectI == -1) return;
        var id = this.outFolders[this.selectObjectI].id;
        var name = this.outFolders[this.selectObjectI].name;
        this.createTableList.create(this.parent, () => { this.refresh() }, id, null);
    }
    /**************************************/
    heightListElement = 0;
    functionResize;
    resize()
    {
        this.heightListElement = document.documentElement.clientHeight - 50 - 50 - 40 - 40 - 30;
    }
    createContextMenu = 
    {
        top: "", 
        left: "", 
        visible: false, 
        i: -1,
        type: ""
    }
    getContextmenu(e, data)
    {
        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.selectObject(data);
        this.createContextMenu.type = this.outFolders[data].objectType;
        e.preventDefault();
    }
    ngOnDestroy() 
    {
        window.removeEventListener("click", this.globalClick, false);
        window.removeEventListener("resize", this.functionResize, false);
    }
}