import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { TableFilterService } from './table-filter.service';
import { QueueService } from './queue.service';
import { environment } from '../../../environments/environment';

declare var trace:any;
@Component({
    selector: 'app-table-editor-v2',
    templateUrl: './table-editor-v2.component.html',
    styleUrls: ['./table-editor-v2.component.css', 'error-table-class-v2.component.css', '../explorer/head-path.component.css'],
    providers: [ QueryService, QueueService ]
})
export class TableEditorV2Component implements OnInit 
{
    @ViewChild('modal') public modal: any;
    @ViewChild("overflowX") overflowX:ElementRef;
    @ViewChild("overflowY") overflowY:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    
    allPath = [];
    scrollEnable = false;
    mode = "Global"; //Local
    id = -1;
    searchObjectId = -1;
    loaded = false;
    imgPath = {
        files: environment.FILES,
        thumbs: environment.THUMBS
    }
    control = 
    {
        state: 0, // общее состояние таблицы
        error: false,
        filterMain: false
    }
    tableFilter:TableFilterService = new TableFilterService();
    right = 
    {
        change: false, 
        cut: false, 
        copy: false,
        head: false
    }
    rules = {
        change: false, // Разрешено изменять
        copy: false, // Разрешено копирование
        cut: false,  // Разрешено вырезать
        paste: false, // В табличном буфере что-то есть
        object: false, // В буфере объект
        event: false, // В буфере есть событие
        type: false // В буфере находится tlist пригодный для типа
    }
    nameTable = "";
    tableIds = {}; // для контроля изменений
    filter = 
    {
        selected: -1,
        list: []
    };
    firstLoaded = true; // Параметр нужен для определения кол-ва строк в таблице
    needUpdate = false;
    listLogin = [];
    dataHeader = [];
    mapHeader = {}; // Карта для свзывания ячеек со столбцами
    dataTable = [];
    firstData = []; // Ссылка на изначальные данные для фильтров
    mapFields = {}; // Сохраняется id для быстрого поиска ячейки
    hiddenColumn = {}; // Объект для скрытия столбцов, хранит номер столбца
    userRowList = {}; // Список строк, которые пользователь добавил из ячейки

    configInput = {
        width: "100px",
        height: "10px",
        top: "0px",
        left: "0px",
        element: null
    }
    inputProperty = {
        set id(value) {
            this._id = value;
            this._colorId = value;
        },
        get id() {
            return this._id;
        },
        _id: -1, // Требуется для запросов
        _colorId: -1, // Требуется для подсвечивания ячейки
        oldValue: "",
        value: "",
        count: 0,
        visible: false,
        values: [],
        typeValues: "",
        type: "",
        eventId: -1,
        linkId: -1,
        close: function() {
            this.visible = false;
            this._colorId = -1;
        },
        clearId: function() {
            this._colorId = -1;
        },
        self: this
    }
    cacheListValues = {};
    constructor(private query:QueryService, private queue:QueueService) 
    { 
        let param:any = this.query.getValueBySrc(location.search);
        this.id = param.id ? Number(param.id) : -1;
        if(param.searchObjectId) this.searchCellId = param.searchObjectId;

        window.addEventListener("click", (e:any) => 
        { 
            this.createContextMenu.visible = false; 
            this.inputProperty.close();
        }, false);
        let setSmallHeader = () => {
            if(document.documentElement.clientWidth <= 768) this.smallHeader.mode = true;
            else this.smallHeader.mode = false;
        }
        window.addEventListener("resize", setSmallHeader, false);
        setSmallHeader();

        window.addEventListener("UpdateFromApp", () => this.updateFromApp() );

        //Загрузка свойств по умолчанию
        this.loadTableProperty("lineNumbering");
        this.loadTableProperty("tableFilter");
        this.loadTableProperty("tableProperty");
        this.loadTableProperty("headerEditorShow");

        //Загрузка пути
        this.query.protectionPost(110, { param: [ this.id ] }, (data) => 
        { 
            this.allPath = data.path;
            this.allPath.push({id: 0, name: "Root"});
            this.allPath.reverse();
        });
    }
    updateFromApp()
    {
        let inputValues = ["searchObjectId", "inputFromApp"];
        for(let i = 0; i < inputValues.length; i++)
        {
            let name = inputValues[i];
            if(!window[name]) continue;
            switch(name)
            {
                case "searchObjectId":
                    this.searchCell(window[name]);
                    break;
                case "inputFromApp":
                    let value = window[name];
                    if(value.logins)
                    {
                        this.listLogin = [];
                        for(var key in value.logins) this.listLogin.push(key);
                    }
                    if(value.update) 
                    {
                        this.needUpdate = true;
                        if(!this.inputProperty.visible)
                            this.loadTable();
                    }
                    break;
            }
            delete window[name];
        }
    }
    ngOnInit() 
    {
        this.loadTable();
    }
    updateEventFromHeader(e)
    {
        switch(e.type)
        {
            case "data": this.loadTable(); break;
            case "column": 
                if(this.hiddenColumn[e.i] === undefined) this.hiddenColumn[e.i] = false;
                this.hiddenColumn[e.i] = !this.hiddenColumn[e.i];
                break;
        }
    }
    loadTable()
    {
        this.loaded = false;
        this.query.protectionPost(250, { param: [ this.id, Number(this.firstLoaded) ]}, (data) => 
        {
            if(data.error === "MORE_300") // Проверка на кол-во загружаемых строк
            {
                this.modal.open({ title: "Таблица содержит более 300 строк. Вы хотите загрузить ее?", data: [], ok: "Да", cancel: "Нет"}, (save) =>
                {
                    if(save)
                    {
                        this.firstLoaded = false;
                        this.loadTable();
                    }
                    else 
                    {
                        this.filter.selected = data.filter;
                        this.filter.list = [];
                        for(i = 0; i < data.filters.length; i++)
                            this.filter.list.push({ id: data.filters[i][0], value: data.filters[i][2]});
                    }
                })
                return;
            }
            if(data.head == undefined) 
            {
                this.control.error = true;
                return;
            }
            this.control.filterMain = data.filterMain;
            /* trace(data.stickers) */
            this.query.onChange({ type: "updateStickers", id: this.id, software: "table", value: data.stickers });
            this.userRowList = data.userRowList;
            this.control.error = false;
            for(let key in data.right) this.right[key] = data.right[key];
            this.right.head = data.changeHead;
            this.tableProperty.rules.change = this.right.change;
            this.nameTable = data.name;
            this.control.state = data.state;
            this.dataHeader = [];
            this.dataTable = [];
            // Формирование заголовка
            for(var i = 0; i < data.head.length; i++)
            {
                let _j = data.head[i][0];
                this.dataHeader[_j] = { 
                    id: data.head[i][1], 
                    name: data.head[i][2],
                    eventId: data.head[i][3],
                    dataType: data.head[i][4],
                    width: data.head[i][5] ? data.head[i][5] + 'px' : null,
                    variable: data.head[i][6] ? data.head[i][6] : null,
                    fill: data.head[i][7] ? data.head[i][7] : false,
                    sort: false
                };
                this.mapHeader[this.dataHeader[_j].id] = _j;
                this.mapFields[this.dataHeader[_j].id] = { ...this.dataHeader[_j], header: true };
            }
            /* this.dataHeader[1].width = 220; */
            // Заполнение фильтров и удаление лишних фильтров
            let j = 0;
            for(; j < this.dataHeader.length; j++)
                if(!this.dataHeader[j]) this.tableFilter.flush(j);
                else
                    if(!this.tableFilter.fields[j]) // Условие чтобы при update сохранить значения фильтров
                        this.tableFilter.append(j);
            this.tableFilter.splice(j)

            this.tableIds = data.tableIds;
            this.query.onChange({ type: "updateTableIds", id: this.id, tableIds: this.tableIds, idLogTableOpen: data.idLogTableOpen, name: this.nameTable });

            this.firstData = data.data;
            this.updateData();
            if(this.searchCellId > 0) this.searchCell(this.searchCellId);
            /* Заполнение фильтров */
            this.filter.selected = data.filter;
            this.filter.list = [];
            for(i = 0; i < data.filters.length; i++)
                this.filter.list.push({ id: data.filters[i][0], value: data.filters[i][2]});

            this.needUpdate = false;
            this.loaded = true;
        });
    }
    updateData()
    {
        this.tableFilter.mapHideRows = {};
        this.tableFilter.count = Object.keys(this.firstData).length;
        this.tableFilter.countHide = 0;
        let rowHide = false; // Скрыть по внутреннему фильтру
        for(var key in this.firstData) 
        {
            let row = this.firstData[key];
            this.dataTable[key] = [];
            rowHide = false;
            for(var column in row) 
            {
                let j = this.mapHeader[column];
                if(j === undefined) continue; // Чтобы исключить __ID__ __NEXT__
                let cell = this.dataTable[key][j] = row[column];
                cell.idColumn = Number(column);
                cell.iRow = Number(key);
                let filterFields = this.tableFilter.fields[j];
                let filterState = this.tableFilter.state[j];
                this.mapFields[cell.id] = cell;
                if(filterFields.value != "")
                {
                    let str = cell.value.toLowerCase();
                    let substr = filterFields.value.toLowerCase();
                    rowHide = this.tableFilter.checkFilterBySign(str, substr, filterFields.sign);
                }
                if(filterState.value != "") 
                    rowHide = this.tableFilter.checkFilterBySignState(cell.state, filterState.value, filterState.sign);
            }
            this.tableFilter.countHide += rowHide ? 1 : 0;
            this.tableFilter.mapHideRows[key] = rowHide;
        }
        // Сортировка по рейтингу
        if(this.sortProperty.column >= 0)
        {
            let column = this.sortProperty.column;
            switch(this.dataHeader[column].dataType)
            {
                case "NUMBER":
                    this.dataTable.sort((_a, _b) => { // Сортировка по числу
                        let a = Number(_a[column].value);
                        let b = Number(_b[column].value);
                        if(this.dataHeader[column].sort)
                            return b - a;
                        else return a - b;
                    });
                    break;
                case "DATETIME":
                    this.dataTable.sort((_a, _b) => { // Сортировка по числу
                        let partsA = _a[column].value.match(/(\d+)/g);
                        let partsB = _b[column].value.match(/(\d+)/g);
                        if(!partsA || !partsB) return 0;
                        let a = new Date(partsA[2], partsA[1]-1, partsA[0], partsA[3], partsA[4]).getTime();
                        let b = new Date(partsB[2], partsB[1]-1, partsB[0], partsB[3], partsB[4]).getTime();
                        if(this.dataHeader[column].sort) return b - a;
                        else return a - b;
                    });
                    break;
                default:
                    this.dataTable.sort((a, b) => { // Сортировка по имени
                        if(this.dataHeader[column].sort)
                        {
                            if (a[column].value > b[column].value) return -1;
                            if (a[column].value < b[column].value) return 1;
                        }
                        else
                        {
                            if (a[column].value < b[column].value) return -1;
                            if (a[column].value > b[column].value) return 1;
                        }
                        return 0;
                    });
                    break;
            }
        }
    }
    saveScroll() // eventListener на скролл
    {
        let scroll = 
        {
            top: this.overflowY.nativeElement.scrollTop,
            left: this.overflowX.nativeElement.scrollLeft
        }
        this.tableProperty.translate = "translateX(" + scroll.left + "px)";
        this.saveTableProperty("scroll", scroll);
        this.scrollEnable = scroll.top != 0;
        /* this.acceptEditField(); */
    }
    saveTableProperty(property, value)
    {
        let prop:any = localStorage.getItem("table_" + this.id);
        if(prop) prop = JSON.parse(prop);
        else prop = {};
        prop[property] = value;
        localStorage.setItem("table_" + this.id, JSON.stringify(prop));
    }
    loadTableProperty(property)
    {
        let prop:any = localStorage.getItem("table_" + this.id);
        if(prop)
        {
            prop = JSON.parse(prop);
            if(prop[property] === undefined) return;
            switch(property)
            {
                case "tableFilter":
                    this.tableFilter.enable = prop.tableFilter;
                    break;
                case "lineNumbering":
                    this.lineNumbering.enable = prop.lineNumbering;
                    break;
                case "scroll":
                    this.overflowX.nativeElement.scrollBy({ left: prop.scroll.left, behavior: 'smooth'});
                    this.overflowY.nativeElement.scrollBy({ top: prop.scroll.top, behavior: 'smooth'});
                    break;
                case "tableProperty":
                    this.tableProperty.visible = prop.tableProperty;
                    break;
                case "headerEditorShow":
                    this.headerEditorShow = prop.headerEditorShow;
                    break;
            }
        }
    }
    smallHeader =
    {
        mode: false, 
        close: false
    }
    openHeader()
    {
        this.smallHeader.close = !this.smallHeader.close;
    }
    headerEditorShow = false;
    changeHeader() // изменить заголовок таблицы
    {
        this.headerEditorShow = !this.headerEditorShow;
        this.saveTableProperty("headerEditorShow", this.headerEditorShow);
    }
    onChangeFilter(i, value) // В строку фильтра вводят значение
    {
        if(value !== undefined) this.tableFilter.fields[i].value = value;
        this.updateData();
    }
    onChangeFilterState(i, value) // В строку фильтра по статусу вводят значение
    {
        this.tableFilter.state[i].value = value;
        this.updateData();
    }
    sortProperty:any = 
    {
        column: -1
    }
    onChangeSort() // Применть сортировку по столбцу
    {
        let i = this.mapHeader[this.inputProperty.id];
        if(this.tableFilter.fields[i].value != "" || this.tableFilter.state[i].value != "") return;
        this.sortProperty.column = i;
        this.dataHeader[i].sort = !this.dataHeader[i].sort;
        this.updateData();
    }
    enableFilters()
    {
        this.tableFilter.changeEnamle();
        if(!this.tableFilter.enable) this.clearFilters();
        this.saveTableProperty("tableFilter", this.tableFilter.enable);
    }
    lineNumbering = { enable: true }
    enableLineNumbering()
    {
        this.lineNumbering.enable = !this.lineNumbering.enable;
        this.saveTableProperty("lineNumbering", this.lineNumbering.enable);
    }
    clearFilters() // Очистить фильтры и сортировку
    {
        this.sortProperty.column = -1;
        this.tableFilter.clear();
        this.updateData();
    }
    getValueFromArrayById(array, id)
    {
        let i = 0;
        for(; i < array.length; i++) if(array[i].id == id) return array[i].value;
    }
    changeMainSelect() // Если пользователь выбрал из tlist значение
    {
        /* if(this.inputProperty.typeValues === "object")  */
        this.inputProperty.value = this.getValueFromArrayById(this.inputProperty.values, this.inputProperty.linkId);
        /* else this.inputProperty.value = this.inputProperty.values[Number(this.inputProperty.valueList)]; */
        this.acceptEditField();
    }
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.right.change)
            if(this.getPositionInTable(e.target, this.configInput))
            {
                let cell = this.configInput.element;
                this.inputProperty.visible = true;
                this.inputProperty.count = 0;
                this.inputProperty.id = cell.id;
                this.inputProperty.eventId = cell.eventId;
                this.inputProperty.type = "value";
                if(cell.type) this.inputProperty.type = cell.type;
                if(this.dataHeader[this.mapHeader[cell.idColumn]].dataType == "DATETIME") 
                    this.inputProperty.type = "datetime";
                this.inputProperty.linkId = cell.linkId;
                if(cell.type == "tlist") 
                {
                    // Запрос списка значений
                    let variables = {};
                    for(let i = 0; i < this.dataHeader.length; i++)
                        if(this.dataHeader[i].variable)
                            variables[this.dataHeader[i].variable] = this.dataTable[cell.iRow][i].value;
                    this.query.protectionPost(304, { param: [ cell.dataType, variables ] }, (data) =>
                    {
                        /* this.inputProperty.typeValues = typeof data[0]; */ // Возможно это относилось к обычному списку
                        this.cacheListValues[cell.linkId] = data;
                        this.inputProperty.values = data;
                        let value = this.inputProperty.values[cell.value];
                        /* if(this.inputProperty.typeValues === "object")  */
                        value = this.getValueFromArrayById(this.inputProperty.values, cell.value);
                        this.inputProperty.oldValue = this.inputProperty.value = value;
                        this.inputProperty.linkId = cell.linkId;
                    });
                }
                else 
                {
                    this.inputProperty.oldValue = this.inputProperty.value = cell.value;
                    this.inputProperty.values = [];
                }
                if(this.inputProperty.type == "datetime") 
                {
                    /* this.openDatetimeModal();
                    this.inputProperty.visible = false; */
                }
                setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
                
                this.tableProperty.listLink.visible = false;
                this.tableProperty.data = {
                    id: this.inputProperty.id,
                    color: cell.color,
                    column: this.dataHeader[this.mapHeader[cell.idColumn]].name,
                    row: cell.iRow + 1
                };
                this.eventStub(e);
                return true;
            }
        return false;
    }
    acceptEditField() // пропал фокус с выделенной ячейки
    {
        if(!this.inputProperty.visible) return;
        this.inputProperty.close();
        let cell = this.configInput.element;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let type = "value";
            let out:any = { id: cell.id }; // при обновлении достаточно знать id
            if(this.inputProperty.values.length > 0) type = "list";
            if(type == "value") out.value = this.inputProperty.value;
            if(type == "list") out.value = { linkId: Number(this.inputProperty.linkId), type: "tlist", value: this.inputProperty.value };
            this.updateField(cell, out);
        }
    }
    updateField(cell, out) // Выставить значение у ячейки
    {
        this.queue.add(252, [ this.id,  JSON.stringify(out) ], (data) =>
        {
            if(data.value !== null && typeof data.value === "object")
            {
                cell.linkId = data.value.linkId;
                cell.value = data.value.value;
            }
            else 
            {
                delete cell.type;
                delete cell.linkId;
                delete cell.image;
                cell.value = data.value;
            }
        });
    }
    onChangeDate(e)
    {
        if(e.default === true) return;
        this.inputProperty.value = e.date + " " + e.time;
        this.acceptEditField();
    }
    getPositionInTable(element, out) // Устанавливает input в положение ячейки
    {
        let id = element.getAttribute("id");
        if(this.mapFields[id] && !this.mapFields[id].header)
        {
            let rect = this.overflowY.nativeElement.getBoundingClientRect();
            let rectElement = element.getBoundingClientRect();
            let top = rectElement.top + (this.overflowY.nativeElement.scrollTop - rect.y) - 2;
            let left = (rectElement.left - rect.x) - 2;
            out.top = top + "px";
            out.left = left + "px";
            out.width = rectElement.width + 4 + "px";
            out.height = rectElement.height + 4 + "px";
            out.element = this.mapFields[id];
            return true;
        }
        return false;
    }
    downEnter(e) // В открытом input пользователь нажал enter
    {
        if(e.keyCode == 13 && this.inputProperty.visible) this.acceptEditField();
    }
    appendObjectInTable(data) // Добавление из левого меню
    {
        switch(data.objectType)
        {
            case "primitive":
                this.queue.add(268, [ this.id, this.dataHeader[this.createContextMenu.i].id, data.primitive ], () => {
                    this.loadTable();
                });
                break;
            case "tlist":
                switch(this.createContextMenu.type)
                {
                    case "cell":
                        let cell = this.configInput.element;
                        this.queue.add(255, [ this.id, data.id, cell.id ], (data) =>
                        {
                            for(let key in data) cell[key] = data[key];
                        });
                        break;
                    case "head":
                        if(data.setType) // Назначение типа столбцу
                            this.queue.add(264, [ this.id, this.dataHeader[this.createContextMenu.i].id, data.id ], () => {
                                this.loadTable();
                            });
                        break;
                }
                break;
            case "file": 
            case "table": 
            case "folder": 
                switch(this.createContextMenu.type)
                {
                    case "cell":
                        let cell = this.configInput.element;
                        this.queue.add(255, [ this.id, data.id, cell.id ], (data) =>
                        {
                            if(data == "ERROR") { this.modal.open({ title: "Ошибка! Вы пытаетесь вставить ссылку на текущую таблицу!", data: [], ok: "Ок", cancel: ""}); return;}
                            for(let key in data) cell[key] = data[key];
                        });
                        break;
                    case "head":
                        break;
                }
                break;
            case "event":
                let eventId = data.id;
                switch(this.createContextMenu.type)
                {
                    case "cell":
                        let cell = this.configInput.element;
                        this.queue.add(262, [ this.id, eventId, cell.id ], (data) => 
                        { 
                            if(data !== false) cell.eventId = eventId;
                        });
                        break;
                    case "head":
                        if(data.setType) // Назначение события столбцу
                            this.queue.add(262, [ this.id, eventId, this.dataHeader[this.createContextMenu.i].id ], () => {
                                this.dataHeader[this.createContextMenu.i].eventId = eventId;
                            });
                        break;
                }
                break;
        } 
    }
    addSticker() // Добавить заметку
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
                this.query.protectionPost(137, { param: [ this.inputProperty.id, Data.data[0][1], "cell", Data.data[1][1] ] }); 
            }
        })
    }
    copyForStatisctic()
    {
        localStorage.setItem("copyForStatistic", JSON.stringify({ id: this.inputProperty.id, type: "column", tableId: this.id }));
    }
    appendRowToTlist() // Добавить значение в список, соответственно добавить строку в таблицу откуда этот список
    {
        let i = 0; //Проверка, есть ли такое значение в списке
        for(; i < this.inputProperty.values.length; i++)
            if(this.inputProperty.values[i].value == this.inputProperty.value) break;
        if(i == this.inputProperty.values.length)
            this.query.protectionPost(275, { param: [ this.inputProperty.linkId, this.inputProperty.value ] }, (data) =>
            {
                // Сюда должны вернуть id ячейки
                this.inputProperty.values.push({
                    id: Number(data),
                    value: this.inputProperty.value
                });
                this.inputProperty.value = "";
            })
    }
    //Работа с контекстным меню
    createContextMenu = 
    {
        top: "", 
        left: "", 
        visible: false,
        type: "",
        i: -1,
        transform: ""
    }
    getContextmenu(e, data, type)
    {
        //Проверка на возможность вставки
        for(let key in this.rules) this.rules[key] = false;
        this.rules.change = this.right.change;
        this.rules.copy = this.right.copy;
        this.rules.cut = this.right.cut;
        let copyExplorer = localStorage.getItem("copyExplorer");
        if(copyExplorer) 
        {
            let copy = JSON.parse(copyExplorer);
            this.rules.object = true;
            this.rules.event = copy.objectType == "event";
            this.rules.type = copy.objectType == "tlist";
        }
        if(localStorage.getItem("copyTable")) this.rules.paste = true; // copyTable используется для копирования ячейки
        switch(type) // Здесь должны заполнится правила
        {
            case "cell":
                if(this.getPositionInTable(e.target, this.configInput))
                {
                    let cell = this.configInput.element;
                    this.inputProperty.id = cell.id;
                    this.inputProperty.eventId = cell.eventId;
                    this.inputProperty.type = "value";
                    if(cell.type) this.inputProperty.type = cell.type;
                    if(this.dataHeader[this.mapHeader[cell.idColumn]].dataType == "DATETIME") 
                    {
                        this.inputProperty.type = "datetime";
                        this.inputProperty.value = cell.value;
                    }
                    this.inputProperty.linkId = cell.linkId;
                    if(cell.id == localStorage.getItem("copyTable")) //Ячейку нельзя вставить саму в себя
                        this.rules.paste = false;
                }
                break;
            case "head":
                this.inputProperty.id = this.dataHeader[data].id;
                this.inputProperty.eventId = this.dataHeader[data].eventId;
                this.tableProperty.listLink.visible = false;
                this.tableProperty.data = {
                    type: "head",
                    id: this.inputProperty.id,
                    width: this.dataHeader[data].width,
                    variable: this.dataHeader[data].variable,
                };
                break;
            case "row":
                break;
        }
        this.rules.paste = this.rules.paste && this.rules.change;
        this.rules.object = this.rules.object && this.rules.change; // Чтобы в html не делать несколько проверок

        this.createContextMenu.transform = this.getTranslateForClientXY(e);
        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.createContextMenu.i = data;
        this.createContextMenu.type = type;
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
    // Операции с заголовком
    pasteObject(setType, primitive)
    {
        let data:any = {};
        if(!primitive)
        {
            data = JSON.parse(localStorage.getItem("copyExplorer"));
            data.setType = setType;
        }
        else 
        {
            data.objectType = "primitive";
            data.primitive = primitive;
        }
        this.appendObjectInTable(data);
        /* localStorage.removeItem("copyExplorer"); */
    }
    // Операции из контекстного меню со строкой
    removeRow() // Удаление строки
    {
        this.queue.add(258, [ this.id, this.firstData[this.createContextMenu.i].__ID__ ], (data) => { this.loadTable(); });
    }
    applyRow() // Принять строку, которая была добавлена пользователем без прав
    {
        let idRow = this.firstData[this.createContextMenu.i].__ID__;
        this.queue.add(276, [ idRow ], () => { 
            delete this.userRowList[idRow];
        });
    }
    cutCopyRowProperty = 
    {
        i: -1,
        idRow1: -1,
        idRow2: -1,
        type: ""
    }
    cutCopyRow(type) // Вырезать строку
    {
        this.cutCopyRowProperty.i = this.createContextMenu.i;
        this.cutCopyRowProperty.idRow1 = this.firstData[this.createContextMenu.i].__ID__;
        this.cutCopyRowProperty.idRow2 = -1;
        this.cutCopyRowProperty.type = type;
        /* localStorage.setItem("copyForStatistic", JSON.stringify({ id: this.cutCopyRowProperty.idRow1, type: "row" })); */ //TODO как-нибудь в будущем
    }
    addRow(type, prevOrNext) // Добавить строку в таблицу
    {
        if(this.dataHeader.length == 0) 
        {
            this.modal.open({ title: "Нужно добавить заголовок!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        let l = this.firstData.length;
        let idRow;
        if(type == "end") 
            idRow = l > 0 ? this.firstData[l - 1].__ID__ : -1;
        else idRow = this.firstData[this.createContextMenu.i].__ID__;

        let fillFields = [];
        let fillFieldsId = [];
        for(let i = 0; i < this.dataHeader.length; i++)
            if(this.dataHeader[i] && this.dataHeader[i].fill) 
            {
                fillFieldsId.push(this.dataHeader[i].id);
                fillFields.push([this.dataHeader[i].name, "", "text"]);
            }
        if(fillFields.length == 0)
            this.queue.add(257, [ this.id, idRow, prevOrNext ], (data) => { this.loadTable(); });
        else this.modal.open({ title: "Заполнить поля", data: fillFields, ok: "Ок", cancel: "Отмена"}, (save) =>
        {
            if(!save) return;
            this.queue.add(257, [ this.id, idRow, prevOrNext ], (data) => {
                this.queue.resolve = () => { this.loadTable(); };
                for(let i = 0; i < fillFieldsId.length; i++)
                {
                    data[fillFieldsId[i]].value = fillFields[i][1];
                    this.queue.add(252, [ this.id,  JSON.stringify(data[fillFieldsId[i]]) ], null);
                }
            });
        });
    }
    addCutRow(prevOrNext) // Вставить вырезанную строку
    {
        if(this.cutCopyRowProperty.idRow1 > 0)
        {
            this.cutCopyRowProperty.idRow2 = this.firstData[this.createContextMenu.i].__ID__;
            if(this.cutCopyRowProperty.type == "cut")
                this.queue.add(269, [ this.id, this.cutCopyRowProperty.idRow1, this.cutCopyRowProperty.idRow2, prevOrNext ], (data) => { this.loadTable(); });
            if(this.cutCopyRowProperty.type == "copy")
                this.queue.add(270, [ this.id, this.cutCopyRowProperty.idRow1, this.cutCopyRowProperty.idRow2, prevOrNext ], (data) => { this.loadTable(); });
            for(let key in this.cutCopyRowProperty) this.cutCopyRowProperty[key] = -1;
        }
    }
    // Операции из контекстного меню с ячейкой
    copyField(copyOrCut) // Копирование ячейки
    {
        localStorage.setItem("copyTable", this.configInput.element.id);
        localStorage.setItem("lastOperationTable", copyOrCut);
    }
    pasteField(typePaste) // вставить ячейку
    {
        let operation = localStorage.getItem("lastOperationTable");
        let queryFunction = (typePaste) =>
        {
            this.loaded = false;
            this.query.protectionPost(259, { param: [this.configInput.element.id, localStorage.getItem("copyTable"), operation, typePaste] }, (data) =>
            {
                if(data == "ERROR") 
                    this.modal.open({ title: "Ошибка! Вы пытаетесь вставить ссылку на текущую таблицу!", data: [], ok: "Ок", cancel: ""});
                else
                    if(operation == "cut")
                    {
                        this.loadTable();
                        if(this.id != data.idTableFrom)
                            this.query.onChange({ type: "updateTable", id: data.idTableFrom}); // Чтобы таблица с вырезанной ячейкой обновилась
                    }
                    else 
                    {
                        let cell = this.configInput.element;
                        this.mapFields[cell.id] = this.dataTable[this.createContextMenu.i][this.mapHeader[cell.idColumn]] = { ...data, idColumn: cell.idColumn };
                    }
                this.loaded = true;            
            });   
            localStorage.removeItem("copyTable");
        }
        if(operation == 'copy') queryFunction(typePaste);
        else queryFunction("");
    }
    setState(state) // Выставить статус у ячейки
    {
        let cell = this.configInput.element;
        this.queue.add(260, [ this.id, cell.id, state ], (data) => 
        {
            cell.state = state;
        });
    }
    removeEvent(head) // Удалить событие с заголовка/из ячейки
    {
        if(head === undefined) this.configInput.element.eventId = null;
        else this.dataHeader[this.createContextMenu.i].eventId = null;
        this.queue.add(263, [ this.id, this.inputProperty.id ], (data) => { });
    }
    clearField() // Очистить значение
    {
        let cell = this.configInput.element;
        this.updateField(cell, { id: this.inputProperty.id, value: "" });
        cell.image = null;
        cell.linkId = null;
        cell.type = null;
    }
    openEventToExplorer(eventId) // Найти событие в таблице
    {
        this.query.onChange({ type: "openFromTable", value: { name: "event", id: eventId }});
    }
    openToExplorer(data) // Найти в таблице
    {
        let cell = this.mapFields[data.id];
        if(data.type == "cell")
            this.query.protectionPost(111, { param: [ "cell", data.linkId ]}, (parent) => 
            {
                if(parent === null) // Связь потеряна
                {
                    this.modal.open({ title: "Ошибка! Элемента, на который ссылается ячейка не существует!", data: [], ok: "Ок", cancel: ""}); 
                    this.query.protectionPost(278, { param: [ cell.id ]});
                    cell.value = null;
                    return;
                }
                if(this.id == parent.tableId) this.searchCell(data.linkId);
                else this.query.onChange({ type: "openFromTable", value: { name: "cell", id: data.linkId }});
            });
        else this.query.onChange({ type: "openFromTable", value: { name: data.type, id: data.type == "tlist" ? cell.dataType : data.linkId }});
    }
    openSoftware(type, id) // Открыть объект
    {
        this.query.onChange({ type: "openFromTable", value: { type: "open", name: type, id: id }});
    }
    /*************************************************/
    tableProperty = {
        active: "table",
        loaded:true,
        visible: false,
        data: {},
        translate: "",
        rules: {
            change: false
        },
        listLink: 
        {
            visible: false,
            empty: true,
            link: null,
            event: null,
            whoRefer: [] // Кто ссылается
        }
    }
    openTableProperty()
    {
        this.tableProperty.visible = !this.tableProperty.visible;
        this.saveTableProperty("tableProperty", this.tableProperty.visible);
    }
    closeTableProperty()
    {
        this.tableProperty.visible = false;
        this.saveTableProperty("tableProperty", this.tableProperty.visible);
    }
    updateCell(e) // При изменении таблицы свойств
    {
        let cell = this.configInput.element;
        if(cell && e.color) cell.color = e.color;
        else 
            if(this.inputProperty.id && e.width)
                this.dataHeader[this.mapHeader[this.inputProperty.id]].width = e.width + "px";
    }
    getListLink()
    {
        this.tableProperty.loaded = false;
        this.query.protectionPost(274, { param: [ this.inputProperty.id ]}, (data) =>
        {
            this.tableProperty.listLink.whoRefer = data.whoRefer;
            this.tableProperty.listLink.empty = this.tableProperty.listLink.whoRefer.length == 0;
            this.tableProperty.listLink.visible = true;
            this.tableProperty.loaded = true;
        });
    }
    /*************************************************/
    searchCellId = -1; // Для отображения ячейки в таблице
    searchTimeout = null
    searchCell(id) // Поиск ячейки и моргание
    {
        clearInterval(this.searchTimeout);
        this.searchCellId = Number(id);
        let searchCellId = this.searchCellId;
        let searchCellCount = 0;
        this.searchTimeout = setInterval(() => 
        {
            if(searchCellCount % 2 == 0) this.searchCellId = -1;
            else this.searchCellId = searchCellId; 
            if(searchCellCount++ > 10) 
            {
                clearInterval(this.searchTimeout);
                this.searchCellId = -1;
            }
        }, 500);
        setTimeout(() => {
            let rect = document.getElementById(id).getBoundingClientRect();
            let scroll = 
            { 
                top: rect.top - (document.documentElement.clientHeight) / 2, 
                left: rect.left - (document.documentElement.clientWidth) / 2
            }
            this.overflowX.nativeElement.scrollBy({ left: scroll.left, behavior: 'smooth'});
            this.overflowY.nativeElement.scrollBy({ top: scroll.top, behavior: 'smooth'});
        }, 100);
    }
    exportToExcel()
    {
        this.query.protectionPost(261, { param: [ this.id ] }, (data) =>
        {
            function downloadURI(uri, name) 
            {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            }
            downloadURI(data[0], data[1]);
        });
    }
    importFromExcel()
    {
        let Data:any = {
            title: "Импорт файла",  
            data: [
                ["Файл", [], "uploader", 128, 118, 1]
            ],
            ok: "Загрузить",
            cancel: "Отмена"
        }
        this.modal.open(Data, (save) =>
        {
            if(save)
            {
                if(Data.data[0][1].length == 0) return "Добавьте файл!";  
                this.query.protectionPost(266, { param: [this.id, Data.data[0][1][0].fullName] }, (data) => 
                { 
                    this.modal.close(false);
                    for(var i = 0; i < data.length; i++) data[i].checked = true;
                    this.modal.open({
                        title: "Импорт файла",  
                        data: [
                            ["Список", data, "import", true]
                        ],
                        ok: "Импорт",
                        cancel: "Отмена"
                    }, (save) =>
                    {
                        if(save)
                        {
                            let modalData = this.modal.Data[0][1];
                            let out = {};
                            for(var i = 0; i < modalData.length; i++)
                                if(modalData[i].checked) 
                                {
                                    if(!out[modalData[i].tableId]) out[modalData[i].tableId] = [];
                                    out[modalData[i].tableId].push({ id: modalData[i].id, value: modalData[i].value });
                                }
                            this.queue.add(267, [JSON.stringify(out)], () => {});
                            this.modal.close(false);
                        }
                    });
                });
                return "Загрузка";
            }
        });
    }
    onFilterChange() // Обновить фильтр
    {
        this.headerEditorShow = false;
        this.saveTableProperty("headerEditorShow", this.headerEditorShow);
        this.query.protectionPost(474, { param: [this.filter.selected, this.id] }, (data) => 
        { 
            this.loadTable();
        });
    }
    eventStub(e) // Заглушка для события click
    {
        e.stopPropagation()
    }
}