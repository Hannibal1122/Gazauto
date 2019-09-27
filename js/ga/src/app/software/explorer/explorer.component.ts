import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
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
import { environment } from '../../../environments/environment';

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
    @ViewChild('miniAppContent') public miniAppContent:ElementRef;
    
    set inputFromApp(value)
    {
        if(value) 
            if(value.search) this.openObjectById("search", value.search);
            else if(value.element) this.openObjectById("element", value.element);
    }
    onChange = null;
    inputs = { id: -1, element: null, searchObjectId: null, updateHistory: null, 
        type: null, // Может быть в режиме корзины
        bind: false, // Если папка наследует
        class: false, // Если элемент создан конструктором
        classRoot: false // Если элемент корневой объекта
    };
    allPath = [];
    parent;
    outFolders = [];
    selectObjectI = -1;
    selectObjectList = {};
    selectModeList = false;
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
        rename: false,
        change: false
    }
    parentRules =
    {
        new: true, 
        paste: false
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
        if(this.inputs && this.inputs.id !== undefined) 
        {
            if(this.inputs.type === "recycle") this.refresh();
            else
            {
                this.openFolder(this.inputs.id, () => 
                {
                    let id = -1;
                    let type = "";
                    if(this.inputs.element) { id = this.inputs.element; type = "element"; }
                    if(this.inputs.searchObjectId) { id = this.inputs.searchObjectId; this.inputs.searchObjectId = -1; type = "search"; }
                    this.openObjectById(type, id);
                });
            }
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
            case "file":
                this.query.protectionPost(143, { param: [ object.id ] }, (fullPath) => 
                {
                    if(object.fileType == 'img')
                    {
                        this.miniApp.open = true;
                        this.miniApp.type = "image";
                        this.miniApp.image.src = environment.FILES + fullPath;
                        this.miniApp.image.loaded = false;
                        let image = new Image();
                        image.src = this.miniApp.image.src;
                        image.onload = () => {
                            let frame = this.miniAppContent.nativeElement.getBoundingClientRect();
                            this.miniApp.image.loaded = true;
                            if(image.width > image.height && frame.width > frame.height)
                            {
                                this.miniApp.image.width = "auto";
                                this.miniApp.image.height = "98%";
                            }
                            else
                            {
                                this.miniApp.image.width = "98%";
                                this.miniApp.image.height = "auto";
                            }
                        }
                    }
                    if(object.fileType == 'xls')
                    {
                        this.miniApp.open = true;
                        this.miniApp.type = "xls";
                        this.miniApp.xls.loaded = false;
                        this.query.protectionPost(142, { param: [ object.id ] }, (data) => 
                        {
                            this.miniApp.xls.data = data;
                            if(data.length == 0) this.miniApp.xls.error = "Не возможно прочитать данные!";
                            else
                            {
                                this.miniApp.xls.error = "";
                                this.miniApp.xls.sheetList = [];
                                for(let i = 0; i < data.length; i++)
                                    this.miniApp.xls.sheetList.push(data[i].name);
                                this.miniApp.xls.setList(0);
                                this.miniApp.xls.loaded = true;
                            }
                        });
                    }
                    if(object.fileType == 'video')
                    {
                        this.miniApp.open = true;
                        this.miniApp.video.error = "";
                        this.miniApp.type = "video";
                        this.miniApp.video.src = environment.FILES + fullPath;
                        this.miniApp.video.loaded = false;
                        this.miniApp.video.canplay = (event) => {
                            this.miniApp.video.loaded = true;
                        };
                        this.miniApp.video.onerror = (event) => {
                            this.miniApp.video.loaded = true;
                            this.miniApp.video.error = "Воспроизведение невозможно!"
                        }
                    }
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
        this.pasteObject.paste(this.parent, (id, parent, type, data) => { this.copyOrPasteWithLoadKey(id, parent, type, data) } )
    }
    queueRemove = [];
    removeObject() // Удалить объект
    {
        if(this.selectModeList && this.queueRemove.length == 0)
        {
            this.queueRemove = [];
            for(let key in this.selectObjectList)
                this.queueRemove.push(Number(key));
            this.changeSelectMode(false);
            this.removeObject();
            return;
        }
        if(this.queueRemove.length > 0)
        {
            this.selectObjectI = this.queueRemove[0];
            this.queueRemove.splice(0, 1);
        }
        if(this.selectObjectI == -1) return;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        var name = this.outFolders[this.selectObjectI].name;
        switch(objectType)
        {
            case "filter":
            case "label": // Используется элемент от папки тк алгоритм удаления одинаков
            case "folder":
                this.createFolder.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "table":
                this.createTable.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "user":
                this.createUser.remove(name, () => { this.refresh() });
                break;
            case "role": 
                this.createRole.remove(name, () => { this.refresh() });
                break;
            case "event": 
                this.createEvent.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "file": 
                this.createFile.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "tlist":
                this.createTableList.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "plan":
                this.createPlanChart.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
                break;
            case "class":
                this.createClassService.remove(id, () => { this.refresh() }, this.inputs.type === "recycle" ? 130 : 112);
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
        if(this.selectModeList)
        {
            this.selectObjectList[i] = this.selectObjectList[i] ? false : true;
            return;
        }
        this.selectObjectI = i;
        var id = this.outFolders[this.selectObjectI].id;
        var objectType = this.outFolders[this.selectObjectI].objectType;
        if(localStorage.getItem("chooseToCompare") != null)
            this.miniApp.choose = JSON.parse(localStorage.getItem("chooseToCompare"));
        this.query.protectionPost(202, { param: [ id ] }, (data) => // Запрос прав и связей наследования
        {
            this.clearRules();
            let right = this.createRight.decodeRights(data.right);
            this.selectRules.copy = objectType == "user" || objectType == "role" ? false : Boolean(right.copy);
            this.selectRules.change = Boolean(right.change);
            this.selectRules.cut = Boolean(right.change);
            this.selectRules.rights = objectType == "user" || objectType == "role" ? false : Boolean(right.right);
            this.selectRules.remove = Boolean(right.change);
            /* this.selectRules.paste = Boolean(right.change); */
            this.selectRules.rename = Boolean(right.change) && objectType != "user" && objectType != "role";
            if(data.class == 1)
            {
                this.selectRules.copy = false; 
                if(objectType == "table" && data.classRoot === null) // Подрузамевается что это корневая папка конструктора
                    this.selectRules.remove = false; 
            }
            this.tableProperty.rules = { 
                change: Boolean(right.change),
                rename: this.selectRules.rename
            };
        });
        this.tableProperty.listLink.visible = false;
    }
    unSelectObject() // отпустить объект
    {
        this.selectObjectI = -1;
        this.clearRules();
    }
    openFolder(id, func?) // открыть папку
    {
        this.changeSelectMode(false);
        this.openStructure(id, () =>
        {
            this.unSelectObject();
            this.query.protectionPost(202, { param: [ id ] }, (data) =>
            {
                this.getCopyExplorer();
                let right = this.createRight.decodeRights(data.right);
                this.parentRules.paste = Boolean(right.change);
                this.parentRules.new = Boolean(right.change);
                
                this.inputs.bind = data.bind !== null; // Если это наследник
                this.inputs.class = data.class != 0; // Если элемент создан конструктором
                this.inputs.classRoot = data.classRoot !== null; // Если элемент корневой объекта
                if(func) func();
                this.inputs.updateHistory();
            });
        });
    }
    closeClassSetting(e)
    {
        this.projectByClassSetting = { open: false, parent: -1, folder: null };
        if(e == "update") this.refresh();
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
            this.inputs.id = parent;
            this.onChange({ type: "updateStickers", id: this.parent, software: "explorer", value: data.stickers, name: this.allPath[this.allPath.length - 1].name });
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
            rename: false,
            change: false
        }
    }
    refresh(clearCopy?)
    {
        if(this.queueRemove.length > 0)
        {
            this.removeObject();
            return;
        }
        if(clearCopy) localStorage.removeItem("copyExplorer");
        if(this.inputs.type === "recycle")
        {
            this.load = true;
            this.query.protectionPost(109, { param: [this.searchInput, this.searchInputType] }, (data) =>
            {
                this.outFolders = data.folder;
                this.load = false;
            });
        }
        else this.openFolder(this.parent);
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
    setFilterByGlobal(filter)
    {
        this.query.protectionPost(450, { param: [ "filter_global", JSON.stringify({ id: filter.objectId, name: filter.name }) ] });
    }
    globalClick = null;
    /**************************************/
    tableProperty = {
        active: "table",
        loaded: true,
        visible: false,
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
        this.tableProperty.loaded = false;
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
            this.tableProperty.loaded = true;
        });
    }
    changeSelectMode(value?) // Выбрать несколько элементов
    {
        this.selectModeList = value === undefined ? !this.selectModeList : value;
        if(!this.selectModeList)
        {
            this.selectRules.remove = false;
            this.selectObjectList = {};
        }
        else this.selectRules.remove = true;
    }
    getCopyExplorer() // Проверка на наличие копируемого элемента
    {
        if(localStorage.getItem("copyExplorer") != null)
        {
            let data = JSON.parse(localStorage.getItem("copyExplorer"));
            this.selectObjectCopy.id = data.id;
            this.selectObjectCopy.type = localStorage.getItem("lastOperationExplorer");
            this.selectObjectCopy.objectType = data.objectType;
        }
        else this.selectObjectCopy = { id: -1, type: "", objectType: "" };
    }
    /**************************************/
    searchCellByTable(id)
    {
        this.onChange({ type: "openFromTable", value: { name: "cell", id: id }});
    }
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
    loadKey = "";
    loadValue = 0;
    loadTimer = null;
    createTableFromFile() // Создать таблицу из файла
    {
        //Может создать заголовок с пустым именем
        this.load = true;
        this.query.protectionPost(140, { param: [] }, (loadKey) =>
        {
            clearTimeout(this.loadTimer);
            this.loadValue = 0;
            this.loadKey = loadKey;
            this.updateLoadKey();
            this.query.protectionPost(139, { param: [ this.outFolders[this.selectObjectI].id, loadKey ] }, (data) =>
            {
                this.refresh();
            });
        });
    }
    copyOrPasteWithLoadKey(id, parent, type, data)
    {
        if(id == -1) { this.load = false; return }
        if(type != "cut")
            switch(data[0][1].selected)
            {
                case "Копировать": type = "copy"; break;
                /* case "Копировать структуру": type = "struct"; break; */
                case "Наследовать": type = "inherit"; break;
            }
        this.query.protectionPost(140, { param: [] }, (loadKey) =>
        {
            clearTimeout(this.loadTimer);
            this.loadValue = 0;
            this.loadKey = loadKey;
            this.updateLoadKey();
            this.query.protectionPost(114, { param: [ id, parent, type, data[2][1], loadKey ] }, (errors) =>
            {
                // В ответ могут прийти только ошибки
                if(Array.isArray(errors))
                {
                    let errorsList = [];
                    for(let i = 0; i < errors.length; i++)
                        errorsList.push(["",
                            errors[i] == "ERROR_CLASS" ? "Вы пытаетесь скопировать объект класса!" :
                                (errors[i] == "ERROR_IN_ITSELF" ? "Конечная папка является дочерней для копируемой!" : "Неизвестная ошибка!"),
                            "html"
                        ]);
                    this.modal.open({ title: "Обнаружены ошибки!", data: errorsList, ok: "Ок", cancel: ""});
                }
                this.refresh();
                localStorage.removeItem("copyExplorer");
            });
        });
    }
    updateLoadKey()
    {
        this.query.protectionPost(141, { param: [ this.loadKey ] }, (data) =>
        {
            if(data === "END") 
            {
                this.loadValue = 0;
                this.loadKey = "";
                return;
            }
            this.loadValue = Number(data);
            this.loadTimer = setTimeout(() => { this.updateLoadKey(); }, 350);
        });
    }
    openTypeAsFolder() // Открыть таблицу как папку для просмотра фильтров
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
    addSticker(object) // Добавить заметку
    {
        let Data = {
            title: "Добавить заметку",  
            data: [
                ["Имя", "", "text"],
                ["Текст", "", "textarea"]
            ],
            ok: "Добавить",
            cancel: "Отмена"
        }
        this.modal.open(Data, (save) =>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                this.query.protectionPost(137, { param: [ object.id, Data.data[0][1], object.objectType, Data.data[1][1] ] }); 
            }
        })
    }
    /**************************************/
    projectByClassSetting = 
    {
        open: false,
        parent: -1,
        folder: null
    }
    createProjectByClass(folder?)
    {
        this.projectByClassSetting = { 
            open: true, 
            parent: this.parent, 
            folder: folder ? { 
                id: folder.id, 
                bindId: folder.classId || folder.bindId // необходимо для поддержки старой версии
            } : null 
        };
    }
    /**************************************/
    miniApp = { // приложения, которые открываются непосредственно в проводнике
        open: false,
        type: "",
        choose: {
            id: -1,
            name: "",
            objectType: "",
            data: {
                tables: {},
                fields: []
            }
        },
        image: {
            src: "",
            loaded: false,
            width: "",
            height: ""
        },
        video:
        {
            src: "",
            canplay: null,
            onerror: null,
            loaded: false,
            error: ""
        },
        xls: {
            table: null,
            loaded: false,
            sheet: 0,
            sheetList: [],
            data: null,
            error: "",
            setList: (index) =>
            {
                this.miniApp.xls.sheet = index;
                this.miniApp.xls.table = this.miniApp.xls.data[index].data;
            }
        }
    }
    chooseToCompare(type, object)
    {
        let choose = this.miniApp.choose;
        if(type == "choose")
        {
            choose.id = object.id;
            choose.name = object.name;
            choose.objectType = object.objectType;
            localStorage.setItem("chooseToCompare", JSON.stringify(choose));
        }
        if(type == "compare")
        {
            if(choose.id == object.id) return;
            if(choose.objectType != object.objectType) return;
            if(choose.objectType == "table")
                this.query.protectionPost(136, { param: [ choose.id, object.id ] }, (data) =>
                {
                    if(data.length != 2) return;
                    this.miniApp.open = true;
                    this.miniApp.type = "choose";
                    choose.data = {
                        tables: { tableA: choose.name, tableB: object.name },
                        fields: data[1]
                    }
                });
        }
    }
    /**************************************/
    createContextMenu = 
    {
        top: "", 
        left: "", 
        visible: false, 
        i: -1,
        type: "",
        translate: null
    }
    createContextMenuMain = 
    {
        top: "", 
        left: "", 
        visible: false,
        translate: null 
    }
    getContextmenu(e, data)
    {
        this.createContextMenu.translate = this.getTranslateForClientXY(e);
        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.selectObject(data);
        this.createContextMenu.type = this.outFolders[data].objectType;
        e.preventDefault();
    }
    getContextmenuMain(e)
    {
        this.getCopyExplorer();
        this.parentRules.paste = this.parentRules.paste 
            && this.selectObjectCopy.id != -1 
            && !(this.selectObjectCopy.objectType == "file" && this.selectObjectCopy.type != "cut");

        this.createContextMenuMain.translate = this.getTranslateForClientXY(e);
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
    getTranslateForClientXY(e)
    {
        let translateX = "0%";
        let translateY = "0%";
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;
        if(e.clientX > w / 2) translateX = "-100%";
        if(e.clientY > h / 2) translateY = "-100%";
        return `translate(${translateX}, ${translateY})`;
    }
    ngOnDestroy() 
    {
        window.removeEventListener("click", this.globalClick, false);
    }
}