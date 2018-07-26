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
    lastUpdateTime = "";
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
    constructor(private query:QueryService) { }
    ngOnInit() 
    {
        this.loadTable(() =>
        {
            this.getLastUpdateTime(() => 
            { 
                this.getListLogin(); 
            });
        });
    }
    tableIds = {}; // для контроля изменений
    loadTable(func?)
    {
        /* trace("update " + this.inputs.id) */
        this.load = true;
        /* let START = new Date().getTime(); */
        this.query.protectionPost(250, { param: [this.inputs.id]}, (data) => 
        {
            /* trace(data) */
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
                this.dataHeader.push({ i: data.head[i][0], value: data.head[i][1] });
            this.tableIds = {};

            let l = Object.keys(data.data).length;
            let key;
            for(key in data.data) if(data.data[key].__NEXT__ == null) break; //Находим null
            for(i = l - 1; i >= 0; i--) // Тут сортировка по next
            {
                this.dataTable[i] = data.data[key];
                this.dataTable[i].__ID__ = key;
                for(var _key in data.data[key])
                    if(_key != "__NEXT__" && data.data[key][_key].tableId && data.data[key][_key].tableId != this.inputs.id) 
                        this.tableIds[data.data[key][_key].tableId] = data.data[key][_key].tableId;
                key = this.getNextI(data.data, key);
            }
            if(this.inputs.searchObjectId) this.searchCell(this.inputs.searchObjectId);
            
            this.lastUpdateTime = data.time;
            this.load = false;
            if(func) func();
            /* trace(new Date().getTime() - START); */
        });
    }
    getNextI(object, next)
    {
        for(var key in object) if(object[key].__NEXT__ == next) return key;
    }
    /*************************************************/
    private globalStop = false;
    private Timer = 
    {
        lastUpdate: null, 
        listLogin: null
    };
    private getLastUpdateTime(func?) // Запрос изменений таблицы
    {
        clearTimeout(this.Timer.lastUpdate);
        this.query.protectionPost(351, { param: [this.inputs.id, this.lastUpdateTime, this.tableIds] }, (data) => 
        { 
            if(data[0] && !this.editTable.inputProperty.visible) 
            {
                this.loadTable();
                this.needUpdate = false;
            }
            else this.needUpdate = data[0];
            if(!this.globalStop) this.Timer.lastUpdate = setTimeout(() => { this.getLastUpdateTime(); }, 10000);
            if(func) func();
        });
    }
    listLogin = [];
    private getListLogin() // Получить список пользователей работающих с таблицей
    {
        clearTimeout(this.Timer.listLogin);
        this.query.protectionPost(352, { param: [ this.inputs.id ] }, (data) => 
        { 
            this.listLogin = [];
            for(var key in data) this.listLogin.push(key);
            if(!this.globalStop) this.Timer.listLogin = setTimeout(() => { this.getListLogin(); }, 30000);
        });
    }
    /*************************************************/
    ngOnDestroy() 
    {
        this.globalStop = true;
    }
    changeHeader() // изменить заголовок таблицы
    {
        var header = [];
        for(var i = 0; i < this.dataHeader.length; i++) header[i] = { value: this.dataHeader[i].value };
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
                {
                    if(Data.data[0][1][i].oldValue)
                        for(var j = 0; j < this.dataTable.length; j++)
                        {
                            this.dataTable[j][Data.data[0][1][i].value] = this.dataTable[j][Data.data[0][1][i].oldValue];
                            delete this.dataTable[j][Data.data[0][1][i].oldValue];
                        }
                    out.push({ value: Data.data[0][1][i].value, oldValue: Data.data[0][1][i].oldValue, i: i});
                }
                let changes = Data.data[0][3];
                this.load = true;
                trace(out)
                trace(changes)
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out), changes ]}, (data) => 
                {
                    this.loadTable();
                });
            }
        });
    }
    appendFromLeftMenu = (() => // Добавление из левого меню
    {
        return (i, j, data, _nameColumn) =>
        {
            let nameColumn = "";
            /* let type = "update"; */
            if(_nameColumn) nameColumn = this.dataHeader[Number(_nameColumn)].value;
            else
                for(var _i = 0; _i < this.dataHeader.length; _i++)
                    if(this.dataHeader[_i].i == j) { nameColumn = this.dataHeader[_i].value; break; }
            
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
                case "value":
                    this.query.protectionPost(303, { param: [data.id] }, (value) =>
                    {
                        let values = [];
                        let valuesI = [];
                        let Data:any = [
                            ["Тип:", {selected: "по значению", data: ["по значению", "по ссылке"]}, "select", { onselect: (selected) =>
                            {
                                if(selected == "по значению" && values.length != 0)
                                    this.modal.Data[1] = ["Значение:", {selected: 0, data: values, value: valuesI }, "select"];
                                else this.modal.Data.splice(1, 1);
                            }}]
                        ];
                        if(value[1] == "array")
                        {   
                            let i = 0;
                            values = value[2];
                            for(; i < values.length; i++) valuesI[i] = i; 
                            Data[1] = ["Значение:", {selected: 0, data: values, value: valuesI }, "select"];
                        }
                        this.modal.open({ 
                            title: "Как добавить элемент в таблицу", 
                            data: Data, 
                            ok: "Добавить", cancel: "Отмена"
                        }, (save) =>
                        {
                            if(save)
                            {
                                if(this.modal.Data[0][1].selected == "по значению")
                                    for(k = beginI; k <= endI; k++)
                                    {
                                        let ID = this.dataTable[k][nameColumn].id;
                                        ((i) =>{
                                            this.addToQueue(256, [ this.inputs.id, data.id, ID, nameColumn, 
                                                this.modal.Data[1] ? this.modal.Data[1][1].selected : null ], (data) =>
                                                {
                                                    this.dataTable[i][nameColumn] = data;
                                                    if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                                                });
                                        })(k);
                                     }
                                if(this.modal.Data[0][1].selected == "по ссылке")
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
                        });
                    });
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
                    let ID = this.dataTable[k][nameColumn].id;
                    this.addToQueue(262, [ this.inputs.id, data.id, ID ], (data) => { trace(data) });
                    break;
            }
            /* trace(data) */
        }
    })();
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
                this.addToQueue(260, [ this.inputs.id,  property.id, property.state ], (data) => 
                {
                    this.dataTable[property.i][property.nameColumn].state = property.state;
                    this.load = false;
                });
                break;
        }
    }
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
                        this.onChange({ type: "updateTable", id: data.idTableFrom});
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
                    this.editTable.setScroll(i);
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
}
