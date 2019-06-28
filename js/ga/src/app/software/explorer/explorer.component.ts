import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { CreateTableService } from "../services/create-table.service";
import { CreateUserService } from "../services/create-user.service";
import { CreateRoleService } from "../services/create-role.service";
import { CreateFolderService } from "../services/create-folder.service";
import { CreateRightService } from "../services/create-right.service";
import { PasteObjectService } from "../services/paste-object.service";
import { CreateFileService } from "../services/create-file.service";
import { CreateInfoService } from "../services/create-info.service";
import { CreateEventService } from "../services/create-event.service";
import { CreateTableListService } from "../services/create-table-list.service";
import { CreateFilterService } from "../services/create-filter.service";
import { CreatePlanChartService } from "../services/create-plan-chart.service";
import { CreateClassService } from "../services/create-class.service";

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
        PasteObjectService,
        CreateFileService,
        CreateInfoService,
        CreateTableListService,
        CreateEventService,
        CreateFilterService,
        CreatePlanChartService,
        CreateClassService
    ]
})
export class ExplorerComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;
    @ViewChild('appTableProperty') public appTableProperty;
    set inputFromApp(value)
    {
        if(value) 
            if(value.search) this.openObjectById("search", value.search);
            else if(value.element) this.openObjectById("element", value.element);
    }
    onChange = null;
    inputs = { id: -1, element: null, searchObjectId: null, updateHistory: null, 
        bind: false, // Если папка наследует
        parentBind: false // Если папка наследуется кем-то
    };
    allPath = [];
    parent;
    outFolders = [];
    selectObjectI = -1;
    load = false;
    selectObjectCopy = { id: -1, type: "", objectType: "" };
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
        private pasteObject: PasteObjectService,
        private createFile: CreateFileService,
        private createInfo: CreateInfoService,
        private createEvent: CreateEventService,
        private createTableList: CreateTableListService,
        private createFilter: CreateFilterService,
        private createPlanChart: CreatePlanChartService,
        private createClassService: CreateClassService,
    ) {}
    ngOnInit() 
    { 
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
        this.pasteObject.modal = this.modal;
        this.createFile.modal = this.modal;
        this.createInfo.modal = this.modal;
        this.createEvent.modal = this.modal;
        this.createTableList.modal = this.modal;
        this.createFilter.modal = this.modal;
        this.createPlanChart.modal = this.modal;
        this.createClassService.modal = this.modal;
        this.globalClick = (e) => 
        { 
            if(e.target.classList[0] == "explorerMain"  && this.selectObjectI != -1) this.unSelectObject(); 
            this.createContextMenu.visible = false;
            this.createContextMenuMain.visible = false;
        }
        window.addEventListener("click", this.globalClick, false);
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
            case "log":
            case "event":
            case "plan":
            case "table":
            case "class":
                this.onChange({ type: "open", value: { name: object.objectType, id: object.id }});
                break;
            case "user":
                this.createObject(null, 'Пользователь', object);
                break;
            case "role":
                this.createObject(null, 'Роль', object)
                break;
            case "tlist":
                this.query.protectionPost(307, { param: [ object.id ] }, (data) => 
                {
                    this.createTableList.create(null, () => { this.refresh() }, data[3], { id: object.id, fieldId: Number(data[2]), name: object.name });
                });
                break;
            case "label":
                this.query.protectionPost(129, { param: [ object.objectId ] }, (data) => 
                {
                    this.openObject(data);
                });
                break;
            case "filter":
                this.createFilter.update(object.objectId, this.inputs.id, object.name);
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
            case "Фильтр":
                this.createFilter.create(id, () => { this.refresh() });
                break;
            case "План-график":
                this.createPlanChart.create(id, () => { this.refresh() });
                break;
            case "Класс":
                this.createClassService.create(id, () => { this.refresh() });
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
        iframe.onload = () => { document.body.removeChild(iframe); } // надо удалять!
        /* document.body.appendChild(iframe); */
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
            case "filter":
            case "label": // Используется элемент от папки тк алгоритм удаления одинаков
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
            case "event": 
                this.createEvent.remove(id, () => { this.refresh() });
                break;
            case "file": 
                this.createFile.remove(id, () => { this.refresh() });
                break;
            case "tlist":
                this.createTableList.remove(id, () => { this.refresh() });
                break;
            case "plan":
                this.createPlanChart.remove(id, () => { this.refresh() });
                break;
            case "class":
                this.createClassService.remove(id, () => { this.refresh() });
                break;
        }
    }
    createLabel()
    {
        if(this.selectObjectI == -1) return;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        var name = this.outFolders[this.selectObjectI].name;

        this.query.protectionPost(100, { param: ["label", id, name, this.parent, 0, ""] }, (data) => 
        {  
            this.refresh();
        });
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
        this.query.protectionPost(202, { param: [ id ] }, (data) => // Запрос прав и связей наследования
        {
            this.clearRules();
            let right = this.createRight.decodeRights(data[0]);
            this.selectRules.copy = objectType == "user" || objectType == "role" ? false : Boolean(right.copy);
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = objectType == "user" || objectType == "role" ? false : Boolean(right.change);
            this.selectRules.remove = Boolean(right.change);
            this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
            this.selectRules.info = Boolean(right.change);
            this.selectRules.rename = Boolean(right.change) && objectType != "user" && objectType != "role" && objectType != "file";
            this.tableProperty.rules = { 
                change: Boolean(right.change),
                rename: this.selectRules.rename
            };
            if(objectType == "file") this.selectRules.download = true;

            if(this.inputs.bind)
            {
                this.selectRules.paste = false; 
                this.selectRules.cut = false; 
                this.selectRules.remove = false; 
            }
        });
        if(this.tableProperty.visible)
        {
            if(this.appTableProperty && !this.appTableProperty.update) this.appTableProperty.update = () => { this.refresh(); };
            this.tableProperty.listLink.visible = false;
        }
    }
    unSelectObject() // отпустить объект
    {
        this.selectObjectCopy = { id: -1, type: "", objectType: "" };
        this.selectObjectI = -1;
        this.clearRules();
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
                    let data = JSON.parse(localStorage.getItem("copyExplorer"));
                    this.selectObjectCopy.id = data.id;
                    this.selectObjectCopy.type = localStorage.getItem("lastOperationExplorer");
                    this.selectObjectCopy.objectType = data.objectType
                }
                let right = this.createRight.decodeRights(data[0]);
                this.selectRules.paste = Boolean(right.change) && this.selectObjectCopy.id != -1;
                this.selectRules.new = Boolean(right.change);
                
                this.inputs.bind = data[1] !== null; // Если это наследник
                this.inputs.parentBind = data[2] > 0; // Если это родитель
                if(this.inputs.bind)
                {
                    this.selectRules.new = false;
                    this.selectRules.paste = false; 
                    this.selectRules.cut = false; 
                    this.selectRules.remove = false; 
                }
                if(this.inputs.parentBind) // Если основная папка кем-то наследуется
                    this.selectRules.paste = false; 
                if(func) func();
                this.inputs.id = id;
                this.inputs.updateHistory();
            });
        });
    }
    closeClassSetting()
    {
        this.projectByClassSetting = { open: false, parent: -1, folderId: -1 };
    }
    addInfo() // Добавить справку
    {
        if(this.selectObjectI != -1)
            this.createInfo.create(this.outFolders[this.selectObjectI].id, () => { this.refresh(); });
    }
    userOff() // Отключить пользователя
    {
        if(this.selectObjectI != -1)
            this.query.protectionPost(132, { param: [this.outFolders[this.selectObjectI].id] });
    }
    openBackFolder()
    {
        this.query.protectionPost(111, { param: [ "folder", this.parent ] }, (data) =>
        {
            if(data.length > 0) this.openFolder(data[0][0]);
        });
    }
    openStructure(parent, func)
    {
        this.load = true;
        this.query.protectionPost(110, { param: [parent] }, (data) => 
        { 
            if(typeof data !== "object") return;
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
    clearRules()
    {
        this.selectRules = {
            new: this.selectRules.new, 
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
    /*******************************************/
    mainSearch = 
    {
        open: false
    }
    openSearch()
    {
        this.mainSearch.open = true;
    }
    searchInput = "";
    searchInputType = "";
    searchInputObject() // Глобальный поиск
    {
        if(this.searchInput == "") return;
        this.load = true;
        this.unSelectObject();
        this.mainSearch.open = false; // Просто закрыть окно поиска
        this.query.protectionPost(124, { param: [this.searchInput, this.searchInputType] }, (data) =>
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
        this.mainSearch.open = false;
    }
    clearSearch()
    {
        if(this.searchInput == "") this.refresh();
    }
    closeMainSearch() // Очистить строку поиска и сбросить результат
    {
        this.mainSearch.open = false;
        this.searchInput = "";
        this.clearSearch();
    }
    globalClick = null;
    /**************************************/
    tableProperty = {
        visible: true,
        data: {},
        rules: {
            change: false,
            rename: false
        },
        listLink: 
        {
            visible: false,
            empty: true,
            fromInherit: [], // От кого наследует
            whoInherit: [], // Кто наследует
            whoRefer: [] // Кто ссылается
        }
    }
    getTableProperty()
    {
        if(this.selectObjectI == -1) return;
        this.tableProperty.visible = true;
    }
    openTableProperty()
    {
        this.tableProperty.visible = !this.tableProperty.visible;
    }
    closeTableProperty()
    {
        this.tableProperty.visible = false;
    }
    getListLink()
    {
        if(this.selectObjectI == -1) return;
        this.query.protectionPost(125, { param: [ this.outFolders[this.selectObjectI].id ]}, (data) =>
        {
            this.tableProperty.listLink.fromInherit = data.fromInherit;
            this.tableProperty.listLink.whoInherit = data.whoInherit;
            this.tableProperty.listLink.whoRefer = [];
            for(var key in data.whoRefer)
                this.tableProperty.listLink.whoRefer.push({
                    id: key, 
                    fields: data.whoRefer[key].fields, 
                    name: data.whoRefer[key].name
                });
            this.tableProperty.listLink.empty = 
                this.tableProperty.listLink.fromInherit.length == 0 
                && this.tableProperty.listLink.whoInherit.length == 0 
                && this.tableProperty.listLink.whoRefer.length == 0;
            this.tableProperty.listLink.visible = true;
        });
    }
    /* closeListLink()
    {
        this.listLink.visible = false;
    } */
    /**************************************/
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
        this.createTableList.create(this.parent, () => { this.refresh() }, id, null);
    }
    openTableFilter() // Открыть таблицу как папку для просмотра фильтров
    {
        this.openFolder(this.outFolders[this.selectObjectI].id);
    }
    openAsTable() // Открыть план как таблицу
    {
        this.onChange({ type: "openFromTable", value: { 
            type: "open",
            name: "table", 
            id: this.outFolders[this.selectObjectI].id 
        }});
    }
    /**************************************/
    projectByClassSetting = 
    {
        open: false,
        parent: -1,
        folderId: -1
    }
    createProjectByClass(folder?)
    {
        this.projectByClassSetting = { open: true, parent: this.parent, folderId: folder ? folder.id : -1 };
    }
    /**************************************/
    createContextMenu = 
    {
        top: "", 
        left: "", 
        visible: false, 
        i: -1,
        type: ""
    }
    createContextMenuMain = 
    {
        top: "", 
        left: "", 
        visible: false, 
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
    getContextmenuMain(e)
    {
        this.createContextMenuMain.left = e.clientX + "px";
        this.createContextMenuMain.top = e.clientY + "px";
        if(e.target.classList[0] == "explorerMain")
        {
            this.createContextMenu.visible = false;
            this.createContextMenuMain.visible = true;
        }
        else this.createContextMenuMain.visible = false;
        e.preventDefault();
    }
    ngOnDestroy() 
    {
        window.removeEventListener("click", this.globalClick, false);
    }
}