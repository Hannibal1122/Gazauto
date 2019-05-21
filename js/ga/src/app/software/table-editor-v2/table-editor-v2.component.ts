import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { TableFilterService } from './table-filter.service';
import { ModalMovedWindowComponent } from '../../system/modal-moved-window/modal-moved-window.component';
import { QueueService } from './queue.service';

declare var trace:any;
declare var $:any;
@Component({
    selector: 'app-table-editor-v2',
    templateUrl: './table-editor-v2.component.html',
    styleUrls: ['./table-editor-v2.component.css', 'error-table-class-v2.component.css'],
    providers: [ QueryService, QueueService ]
})
export class TableEditorV2Component implements OnInit 
{
    @ViewChild('modal') public modal: any;
    @ViewChild("mainContainer") mainContainer:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    @ViewChild("modalMovedWindow") modalMovedWindow:ModalMovedWindowComponent;
    
    id = -1;
    searchObjectId = -1;
    loaded = false;
    control = 
    {
        state: 0,
        error: false,
        id: -1
    }
    tableFilter:TableFilterService = new TableFilterService();
    right = 
    {
        change: false, 
        cut: false, 
        copy: false
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
    listLogin = [];
    dataHeader = [];
    mapHeader = {}; // Карта для свзывания ячеек со столбцами
    dataTable = [];
    firstData = []; // Ссылка на изначальные данные для фильтров
    mapFields = {}; // Сохраняется id для быстрого поиска ячейки

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
            /* this.self.onChange.emit({ type: "bottomControlPanel", id: value }); */
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
        valueList: "",
        typeValues: "",
        type: "",
        eventId: -1,
        linkId: -1,
        close: function() {
            this.visible = false;
            this._colorId = -1;
            /* this.self.onChange.emit({ type: "bottomControlPanel", id: -1 }); */
        },
        clearId: function() {
            this._colorId = -1;
            /* this.self.onChange.emit({ type: "bottomControlPanel", id: -1 }); */
        },
        self: this
    }
    cacheListValues = {};
    constructor(private query:QueryService, private queue:QueueService) 
    { 
        let param:any = this.getValueBySrc(location.search);
        this.id = param.id ? Number(param.id) : -1;
        if(param.searchObjectId) this.searchCell(param.searchObjectId);

        window.addEventListener("click", (e:any) => 
        { 
            this.createContextMenu.visible = false; 
            if(e.target.getAttribute("name") == "clickArea")
                this.inputProperty.close();
        }, false);

        window.addEventListener("UpdateSrc", () => this.updateSrc() );
    }
    updateSrc()
    {
        if(window["searchObjectId"])
            this.searchCell(window["searchObjectId"]);
    }
    ngOnInit() 
    {
        this.loadTable();
    }
    getValueBySrc(src) // Разбить параметры строки
    {
        let a = src.replace("?", "");
        let out = {};
        a = a.split("&");
        for(let i = 0; i < a.length; i++)
        {
            let b = a[i].split("=");
            out[b[0]] = b[1];
        }
        return out;
    }
    loadTable()
    {
        this.loaded = false;
        this.query.protectionPost(250, { param: [ this.id ]}, (data) => 
        {
            if(data.head == undefined) 
            {
                this.control.error = true;
                return;
            }
            this.control.error = false;
            for(let key in data.right) this.right[key] = data.right[key];
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
                    dataType: data.head[i][4]
                };
                // Заполнение фильтров
                this.tableFilter.fields[_j] = { value: "", sign: "*" };
                this.tableFilter.state[_j] = { value: "", sign: "=" };
                this.mapHeader[this.dataHeader[_j].id] = _j;
                this.mapFields[this.dataHeader[_j].id] = { ...this.dataHeader[_j], header: true };
            }
            this.tableIds = data.tableIds;
            
            /* this.onChange({ type: "updateTableIds", id: this.inputs.id, tableIds: this.tableIds, idLogTableOpen: data.idLogTableOpen }); */

            this.firstData = data.data;
            this.updateData();
            /* if(this.inputs.searchObjectId) this.searchCell(this.inputs.searchObjectId); */

            /* Заполнение фильтров */
            this.filter.selected = data.filter;
            this.filter.list = [];
            for(i = 0; i < data.filters.length; i++)
                this.filter.list.push({ id: data.filters[i][0], value: data.filters[i][2]});

            this.loaded = true;
            setTimeout(() => {
                this.setScroll();
            }, 100)
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
                let filterFields = this.tableFilter.fields[j];
                let filterState = this.tableFilter.state[j];
                this.mapFields[cell.id] = cell;
                if(filterFields.value != "")
                {
                    let str = (cell.listValue || cell.value).toLowerCase();
                    let substr = filterFields.value.toLowerCase();
                    rowHide = this.tableFilter.checkFilterBySign(str, substr, filterFields.sign);
                }
                if(filterState.value != "") 
                    rowHide = this.tableFilter.checkFilterBySignState(cell.state, filterState.value, filterState.sign);
            }
            this.tableFilter.mapHideRows[key] = rowHide;
        }
    }
    setScroll()
    {
        let scroll:any = localStorage.getItem("table_scroll_" + this.id);
        if(scroll) 
        {
            scroll = JSON.parse(scroll);
            this.mainContainer.nativeElement.scrollTop = scroll.top;
            this.mainContainer.nativeElement.scrollLeft = scroll.left;
        }
    }
    saveScroll()
    {
        let scroll = 
        {
            top: this.mainContainer.nativeElement.scrollTop,
            left: this.mainContainer.nativeElement.scrollLeft
        }
        localStorage.setItem("table_scroll_" + this.id, JSON.stringify(scroll));
    }
    changeHeader() // изменить заголовок таблицы
    {
        var header = [];
        for(var i = 0; i < this.dataHeader.length; i++) header[i] = { id: this.dataHeader[i].id, value: this.dataHeader[i].name };
        var Data:any = {
            title: "Редактор заголовка",  
            data: [
                ["Столбцы", header, "listTable", []]
            ],
            ok: "Изменить",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save) =>
        {
            if(save)
            {
                let out = [];
                for(var i = 0; i < Data.data[0][1].length; i++)
                out.push({ id: Data.data[0][1][i].id, value: Data.data[0][1][i].value, oldValue: Data.data[0][1][i].oldValue, i: i});
                let changes = Data.data[0][3];
                this.loaded = false;
                this.query.protectionPost(251, { param: [ this.id, JSON.stringify(out), changes ]}, (data) => 
                {
                    this.loadTable();
                });
            }
        });
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
    clearFilters() // Очистить фильтры
    {
        for(let i = 0; i < this.tableFilter.fields.length; i++)
            this.tableFilter.fields[i].value = this.tableFilter.state[i].value = "";
        this.updateData();
    }
    getValueFromArrayById(array, id)
    {
        let i = 0;
        for(; i < array.length; i++) if(array[i].id == Number(id)) return array[i].value;
    }
    changeMainSelect() // Если пользователь выбрал из tlist значение
    {
        if(this.inputProperty.typeValues === "object") 
            this.inputProperty.value = this.getValueFromArrayById(this.inputProperty.values, this.inputProperty.valueList);
        else this.inputProperty.value = this.inputProperty.values[Number(this.inputProperty.valueList)];
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
                if(cell.listValue !== undefined) 
                {
                    // Запрос списка значений
                    this.query.protectionPost(304, { param: [cell.linkId] }, (data) =>
                    {
                        this.inputProperty.typeValues = typeof data[0];
                        this.cacheListValues[cell.linkId] = data;
                        this.inputProperty.values = data;
                        let value = this.inputProperty.values[cell.value];
                        if(this.inputProperty.typeValues === "object") 
                            value = this.getValueFromArrayById(this.inputProperty.values, cell.value);
                        this.inputProperty.oldValue = this.inputProperty.value = value;
                        this.inputProperty.valueList = cell.value;
                    });
                }
                else 
                {
                    this.inputProperty.oldValue = this.inputProperty.value = cell.value;
                    this.inputProperty.values = [];
                }
                if(this.inputProperty.type == "datetime") 
                {
                    this.openDatetimeModal();
                    this.inputProperty.visible = false;
                }
                setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
                return true;
            }
        return false;
    }
    addRow(type, prevOrNext) // Добавить в строку таблицу
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
        this.queue.add(257, [ this.id, idRow, prevOrNext ], (data) => { this.loadTable(); });
    }
    acceptEditField() // пропал фокус с выделенной ячейки
    {
        this.inputProperty.close();
        let cell = this.configInput.element;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let type = "value";
            let out:any = { id: cell.id }; // при обновлении достаточно знать id
            let listValue = null;
            let linkType = "value";
            if(this.inputProperty.values.length > 0)
            {
                let _i = 0;
                listValue = this.inputProperty.value;
                if(typeof this.inputProperty.values[0] === "object") // Проверка на наличие в списке значения
                {
                    linkType = "tlist";
                    for(; _i < this.inputProperty.values.length; _i++) if(this.inputProperty.values[_i].value == listValue) break;
                }
                else 
                    for(; _i < this.inputProperty.values.length; _i++) if(this.inputProperty.values[_i] == listValue) break;
                if(_i != this.inputProperty.values.length) type = "list";
            }
            if(type == "value") out.value = this.inputProperty.value;
            if(type == "list") out.value = { value: this.inputProperty.valueList, linkId: cell.linkId, type:linkType, listValue: listValue };
            this.updateField(cell, out);
        }
    }
    updateField(cell, out) // Выставить значение у ячейки
    {
        this.queue.add(252, [ this.id,  JSON.stringify(out) ], (data) =>
        {
            if(typeof data.value === "object")
            {
                cell.listValue = data.value.listValue;
                cell.value = data.value.value;
            }
            else cell.value = data.value;
        });
    }
    openDatetimeModal() // Открыть модальное окно с вставкой времени
    {
        this.modalMovedWindow.open = true;
        this.modalMovedWindow.inputValue = this.inputProperty.value;
        this.modalMovedWindow.change = (datetime) =>
        {
            this.inputProperty.value = datetime;
            this.acceptEditField();
        };
    }
    getPositionInTable(element, out) // Устанавливает input в положение ячейки
    {
        let id = element.getAttribute("id");
        if(this.mapFields[id] && !this.mapFields[id].header)
        {
            let offset = $(element).offset();
            out.top = offset.top + "px";
            out.left = offset.left + "px";
            out.width = element.clientWidth + "px";
            out.height = element.clientHeight + "px";
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
        if(localStorage.getItem("copyTable")) this.rules.paste = true;
        switch(type) // Здесь должны заполнится правила
        {
            case "cell":
                if(this.getPositionInTable(e.target, this.configInput))
                {
                    let cell = this.configInput.element;
                    trace(cell)
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
                break;
            case "row":
                break;
        }
        this.rules.paste = this.rules.paste && this.rules.change;
        this.rules.object = this.rules.object && this.rules.change; // Чтобы в html не делать несколько проверок

        let height = this.mainContainer.nativeElement.clientHeight;
        if(e.clientY > height / 2) this.createContextMenu.transform = "translate(0, -100%)";
        else this.createContextMenu.transform = null;

        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.createContextMenu.i = data;
        this.createContextMenu.type = type;
        e.preventDefault();
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
                            this.onChange({ type: "updateTable", id: data.idTableFrom}); // Чтобы таблица с вырезанной ячейкой обновилась
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
        cell.linkId = null;
        cell.type = null;
    }
    openEventToExplorer(eventId) // Найти событие в таблице
    {
        this.onChange({ type: "openFromTable", value: { name: "event", id: eventId }});
    }
    openToExplorer(data) // Найти в таблице
    {
        if(data.type == "cell")
            this.query.protectionPost(111, { param: [ "cell", data.linkId ]}, (idParent) => 
            {
                if(this.id == idParent[0][0]) this.searchCell(data.linkId);
                else this.onChange({ type: "openFromTable", value: { name: "cell", id: data.linkId }});
            });
        else this.onChange({ type: "openFromTable", value: { name: data.type, id: data.linkId }});
    }
    openSoftware(type, id) // Открыть объект
    {
        this.onChange({ type: "openFromTable", value: { type: "open", name: type, id: id }});
    }
    onChange(out)
    {
        localStorage.setItem("propertyIFrame", JSON.stringify(out));
    }
    /*************************************************/
    searchCellId = -1; // Для отображения ячейки в таблице
    searchTimeout = null
    searchCell(id) // Поиск ячейки и моргание
    {
        let td = document.getElementById(id);
        this.mainContainer.nativeElement.scrollTop = td.offsetTop;
        this.mainContainer.nativeElement.scrollLeft = td.scrollLeft;

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
                this.searchObjectId = -1;
            }
        }, 500);
    }
}