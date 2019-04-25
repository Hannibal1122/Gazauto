import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
declare var $:any;
@Component({
    selector: 'app-table-editor',
    templateUrl: './table-editor.component.html',
    styleUrls: ['./table-editor.component.css'],
    providers: [ QueryService ]
})
export class TableEditorComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;
    @ViewChild('editTable') public editTable: any;
    
    onChange = null;
    set inputFromApp(value)
    {
        if(value && value.search) this.searchCell(value.search);
        if(value && value.logins)
        {
            this.listLogin = [];
            for(var key in value.logins) this.listLogin.push(key);
        }
        if(value && value.update) this.loadTable();
    }

    inputs = { id: -1, searchObjectId: -1 };
    firstData = {};
    dataHeader = [];
    dataTable = [];
    mode = "Global"; //Local
    nameTable = "";
    stateTable = 0;
    error = false;
    load = false;
    needUpdate = false;
    rules = 
    {
        save: false,
        head: true, 
        cut: false, 
        copy: false, 
        paste: false,
        add: true,
    }
    tableIds = {}; // для контроля изменений
    filter = 
    {
        selected: -1,
        list: []
    };
    listLogin = [];
    constructor(private query:QueryService) { }
    ngOnInit() 
    {
        this.loadTable();
    }
    loadTable(func?)
    {
        /* trace("update " + this.inputs.id) */
        this.load = true;
        /* let START = new Date().getTime(); */
        this.query.protectionPost(250, { param: [this.inputs.id]}, (data) => 
        {
            if(data.head == undefined) 
            {
                this.error = true;
                return;
            }
            this.error = false;
            this.rules.head = data.changeHead ? false : true;
            if(this.rules.head && !data.change) this.rules.head = false;
            this.rules.add = this.editTable.change = data.change;
            this.nameTable = data.name;
            this.stateTable = data.state;
            this.dataHeader = [];
            this.dataTable = [];
            this.firstData = data.data;
            for(var i = 0; i < data.head.length; i++)
                this.dataHeader.push({ i: data.head[i][0], value: data.head[i][1], name: data.head[i][2] });
            this.tableIds = data.tableIds;
            this.onChange({ type: "updateTableIds", id: this.inputs.id, tableIds: this.tableIds, idLogTableOpen: data.idLogTableOpen });

            for(var key in data.data) this.dataTable.push(data.data[key]);
            if(this.inputs.searchObjectId) this.searchCell(this.inputs.searchObjectId);

            /* Заполнение фильтров */
            this.filter.selected = data.filter;
            this.filter.list = [];
            for(i = 0; i < data.filters.length; i++)
                this.filter.list.push({ id: data.filters[i][0], value: data.filters[i][2]});

            this.load = false;
            if(func) func();
            /* trace(new Date().getTime() - START); */
        });
    }
    onFilterChange() // Обновить фильтр
    {
        this.query.protectionPost(474, { param: [this.filter.selected, this.inputs.id] }, (data) => 
        { 
            this.loadTable();
        });
    }
    /*************************************************/
    ngOnDestroy() 
    {
    }
    changeHeader() // изменить заголовок таблицы
    {
        var header = [];
        for(var i = 0; i < this.dataHeader.length; i++) header[i] = { id: this.dataHeader[i].value, value: this.dataHeader[i].name };
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
                this.load = true;
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out), changes ]}, (data) => 
                {
                    this.loadTable();
                });
            }
        });
    }
    appendFromLeftMenu(data) // Добавление из левого меню
    {
        let i, j;
        let nameColumn = "";
        let _nameColumn = "";

        switch(this.editTable.createContextMenu.type)
        {
            case "cell":
                i = this.editTable.configInput.i;
                j = this.editTable.configInput.j;
                for(var _i = 0; _i < this.dataHeader.length; _i++)
                    if(this.dataHeader[_i].i == j) 
                    { 
                        nameColumn = this.dataHeader[_i].value; 
                        break; 
                    }
                break;
            case "head":
                _nameColumn = this.editTable.createContextMenu.i;
                nameColumn = this.dataHeader[Number(_nameColumn)].value;
                break;
        }
        let beginI = i;
        let endI = i;
        let k = beginI;
        let length = 1;
        if(_nameColumn)
        {
            beginI = 0;
            endI = this.dataTable.length - 1;
            length = this.dataTable.length;
        }
        switch(data.objectType)
        {
            case "tlist":
                // Проверка на вставку в себя (по tableId)
                if(_nameColumn && data.setType) // Назначение типа столбцу ПОКА НЕ рЕШЕНО КАК ДЕЛАТЬ
                    this.addToQueue(264, [ this.inputs.id, this.dataHeader[Number(_nameColumn)].value, data.id ], () => {
                        this.loadTable();
                    });
                else
                {
                    for(k = beginI; k <= endI; k++)
                    {
                        let ID = this.dataTable[k][nameColumn].id;
                        ((i) =>{
                            this.addToQueue(255, [ this.inputs.id, data.id, ID, nameColumn ], (data) =>
                            {
                                this.dataTable[i][nameColumn] = data;
                                if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                            });
                        })(k);
                    }
                }
                break;
            case "file": 
            case "table": 
                for(k = beginI; k <= endI; k++)
                {
                    let ID = this.dataTable[k][nameColumn].id;
                    ((i) =>{
                        this.addToQueue(255, [ this.inputs.id, data.id, ID, nameColumn], (data) =>
                        {
                            if(data == "ERROR") { this.modal.open({ title: "Ошибка! Вы пытаетесь вставить ссылку на текущую таблицу!", data: [], ok: "Ок", cancel: ""}); return;}
                            this.dataTable[i][nameColumn] = data;
                            if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                        });
                    })(k);
                }
                break;
            case "event":
                let eventId = data.id;
                for(k = beginI; k <= endI; k++)
                {
                    let ID = this.dataTable[k][nameColumn].id;
                    ((i) =>{
                        this.addToQueue(262, [ this.inputs.id, eventId, ID ], (data) => 
                        { 
                            if(data !== false) this.dataTable[i][nameColumn].eventId = eventId;
                            if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                        });
                    })(k);
                }
                break;
        }
        /* trace(data) */
    }
    addRow()
    {
        if(this.dataHeader.length == 0) 
        {
            this.modal.open({ title: "Нужно добавить заголовок!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        let l = this.dataTable.length;
        this.update({ type: "row", idRow: l > 0 ? this.dataTable[l - 1].__ID__ : -1, idNextRow: -1 });
    }
    update(property)
    {
        switch(property.type)
        {
            case "row": // Добавление строки
                this.addToQueue(257, [ this.inputs.id, property.idRow, property.idNextRow ], (data) => { this.loadTable(); });
                break;
            case "field": // Обновление ячейки
                this.addToQueue(252, [ this.inputs.id,  JSON.stringify(property.out) ], (data) =>
                {
                    if(typeof data.value === "object")
                    {
                        this.dataTable[property.i][property.nameColumn].listValue = data.value.listValue;
                        this.dataTable[property.i][property.nameColumn].value = data.value.value;
                        this.editTable.data = this.dataTable; // update edit table
                    }
                    else // Либо insert, либо update 
                    {
                        data.state = this.dataTable[property.i][property.nameColumn].state; // Костыль чтобы не терялись параметры
                        data.eventId = property.eventId;
                        this.dataTable[property.i][property.nameColumn] = data;
                        this.editTable.setCell = { i: property.i, key: property.nameColumn, value: data };
                    }
                });
                break;
            case "remove": // Удаление строки
                this.addToQueue(258, [ this.inputs.id, this.dataTable[property.i].__ID__ ], (data) => { this.loadTable(); });
                break;
            case "operation": // Обновление возможных операций с ячейкой
                this.rules.copy = property.rules.copy;
                this.rules.cut = property.rules.cut;
                this.rules.paste = property.rules.paste;
                break;
            case "explorer": // Открыть значение в проводнике
                if(property.data.type == "cell")
                    this.query.protectionPost(111, { param: [ "cell", property.data.linkId ]}, (idParent) => 
                    {
                        if(this.inputs.id == idParent[0][0]) this.searchCell(property.data.linkId);
                        else this.onChange({ type: "openFromTable", value: { name: "cell", id: property.data.linkId }});
                    });
                else this.onChange({ type: "openFromTable", value: { name: property.data.type, id: property.data.linkId }});
                break;
            case "state": // Изменить состояние ячейки
                this.addToQueue(260, [ this.inputs.id, property.id, property.state ], (data) => 
                {
                    this.dataTable[property.i][property.nameColumn].state = property.state;
                    this.load = false;
                });
                break;
            case "event": // Открыть в проводнике событие
                this.onChange({ type: "openFromTable", value: { name: "event", id: property.eventId }});
                break;
            case "removeEvent":
                this.dataTable[property.i][property.nameColumn].eventId = null;
                this.editTable.data = this.dataTable; // update edit table
                this.addToQueue(263, [ this.inputs.id, property.id ], (data) => { });
                break;
            case "paste":
                this.pasteField();
                break;
            case "pasteObject":
                let data = JSON.parse(localStorage.getItem("copyExplorer"));
                data.setType = property.setType;
                this.appendFromLeftMenu(data);
                localStorage.removeItem("copyExplorer");
                break;
            case "copyOrCut":
                this.copyField(property.copyOrCut);
                break;
        }
    }
    /*************************************************/
    queue = [];
    addToQueue(nquery, param, func) // Добавить запрос в очередь
    {
        this.queue.push({ nquery: nquery, param: param, func: func });
        if(this.queue.length == 1) this.updateQueue();
    }
    updateQueue()
    {
        this.load = true;
        let queue = this.queue[0];
        this.query.protectionPost(queue.nquery, { param: queue.param }, (data) => 
        {
            queue.func(data);
            this.queue.splice(0, 1);
            if(this.queue.length != 0) this.updateQueue();
            else this.load = false;
        });
    }
    copyField(copyOrCut) // Копирование ячейки
    {
        let i = this.editTable.configInput.i;
        let j = this.editTable.configInput.j;
        localStorage.setItem("copyTable", this.editTable.listTables[i][j].id);
        localStorage.setItem("lastOperationTable", copyOrCut);
        this.rules.copy = this.rules.cut = this.rules.paste = false;
    }
    pasteField() // вставить ячейку
    {
        let i = this.editTable.configInput.i;
        let j = this.editTable.configInput.j;
        let operation = localStorage.getItem("lastOperationTable");
        let queryFunction = (typePaste) =>
        {
            this.load = true;
            this.query.protectionPost(259, { param: [this.editTable.listTables[i][j].id, localStorage.getItem("copyTable"), operation, typePaste] }, (data) =>
            {
                if(data == "ERROR") 
                    this.modal.open({ title: "Ошибка! Вы пытаетесь вставить ссылку на текущую таблицу!", data: [], ok: "Ок", cancel: ""});
                else
                    if(operation == "cut")
                    {
                        this.loadTable();
                        if(this.inputs.id != data.idTableFrom)
                            this.onChange({ type: "updateTable", id: data.idTableFrom}); // Чтобы таблица с вырезанной ячейкой обновилась
                    }
                    else this.editTable.listTables[i][j] = data;
                this.load = false;            
            });   
            localStorage.removeItem("copyTable");
            localStorage.removeItem("copyTableValue");
            this.rules.copy = this.rules.cut = this.rules.paste = false;
        }
        if(operation == 'copy')
            this.modal.open({ 
                title: "Как добавить элемент в таблицу", 
                data: [["Тип:", {selected: "по значению", data: ["по значению", "по ссылке"]}, "select"]], 
                ok: "Добавить", cancel: "Отмена"
            }, (save) =>
            {
                if(save)
                {
                    let typePaste = "cell";
                    if(this.modal.Data[0][1].selected == "по значению") typePaste = "value";
                    queryFunction(typePaste);
                }
            });
        else queryFunction("");
    }
    /*************************************************/
    searchCellId = -1; // Для отображения ячейки в таблице
    searchTimeout = null
    searchCell(id) // Поиск ячейки и моргание
    {
        clearInterval(this.searchTimeout);
        this.searchCellId = Number(id);
        for(var i = 0; i < this.dataTable.length; i++)
            for(var key in this.dataTable[i])
                if(key != "__ID__" && key != "__NEXT__" && this.dataTable[i][key].id == id) 
                {
                    this.editTable.setScroll(id);
                    break;
                }
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
                this.inputs.searchObjectId = -1;
            }
        }, 500);
    }
    exportToExcel()
    {
        this.query.protectionPost(261, { param: [ this.inputs.id ] }, (data) =>
        {
            function downloadURI(uri, name) 
            {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            }
            downloadURI(data[0], data[1]);
            $("#BlockLoaderPanel").fadeOut(400);
        })
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
                this.query.protectionPost(266, { param: [this.inputs.id, Data.data[0][1][0].fullName] }, (data) => 
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
                            this.addToQueue(267, [JSON.stringify(out)], () => {});
                            this.modal.close(false);
                        }
                    });
                });
                return "Загрузка";
            }
        });
    }
}