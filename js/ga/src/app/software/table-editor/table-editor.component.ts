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
        this.loadTable();
        this.getLastUpdateTime(() => { this.getListLogin(); });
    }
    tableIds = {}; // для контроля изменений
    loadTable()
    {
        /* trace("update " + this.inputs.id) */
        this.load = true;
        this.query.protectionPost(250, { param: [this.inputs.id]}, (data) => 
        {
            if(data.head == undefined) 
            {
                this.error = true;
                return;
            }
            this.error = false;
            this.rules.head = this.rules.add = this.editTable.change = data.change;
            this.nameTable = data.name;
            this.dataHeader = [];
            this.dataTable = [];
            this.firstData = data.data;
            for(var i = 0; i < data.head.length; i++)
                this.dataHeader.push({ i: data.head[i][0], value: data.head[i][1] });
            this.tableIds = {};
            for(var key in data.data)
            {
                let i = this.dataTable.length;
                this.dataTable[i] = data.data[key];
                this.dataTable[i].__ID__ = key;
                for(var _key in data.data[key])
                    if(data.data[key][_key].tableId) this.tableIds[data.data[key][_key].tableId] = data.data[key][_key].tableId;
            }
            if(this.inputs.searchObjectId) this.searchCell(this.inputs.searchObjectId);
            
            this.lastUpdateTime = data.time;
            this.load = false;
            
        });
    }
    /*************************************************/
    private globalStop = false;
    private lastUpdateTimer = null;
    private getLastUpdateTime(func?) // Запрос изменений таблицы
    {
        clearTimeout(this.lastUpdateTimer);
        this.query.protectionPost(351, { param: [this.inputs.id, this.lastUpdateTime, this.tableIds] }, (data) => 
        { 
            if(data[0] && !this.editTable.inputProperty.visible) 
            {
                this.loadTable();
                this.needUpdate = false;
            }
            else this.needUpdate = data[0];
            if(!this.globalStop) this.lastUpdateTimer = setTimeout(() => { this.getLastUpdateTime(); }, 10000);
            if(func) func();
        });
    }
    private listLoginTimer = null;
    listLogin = [];
    private getListLogin() // Получить список пользователей работающих с таблицей
    {
        clearTimeout(this.listLoginTimer);
        this.query.protectionPost(352, { param: [ this.inputs.id ] }, (data) => 
        { 
            this.listLogin = [];
            for(var key in data)
                this.listLogin.push(key);
            if(!this.globalStop) this.listLoginTimer = setTimeout(() => { this.getListLogin(); }, 30000);
        });
    }
    /*************************************************/
    ngOnDestroy() 
    {
        this.globalStop = true;
    }
    changeNameTable()
    {
        this.load = true;
        this.query.protectionPost(253, { param: [this.inputs.id, this.nameTable]}, (data) => { this.load = false; });
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
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out), changes ]}, (data) => 
                {
                    this.dataHeader = [];
                    for(var i = 0; i < Data.data[0][1].length; i++)
                        this.dataHeader[i] = { value: Data.data[0][1][i].value, i: i };

                    this.editTable.head = this.dataHeader; // update edit table
                    this.editTable.data = this.dataTable; // update edit table
                    this.load = false;
                });
            }
        });
    }
    appendFromLeftMenu = (() => // Добавление из леаого меню
    {
        return (i, j, data, _nameColumn) =>
        {
            let nameColumn = "";
            let type = "update";
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
                                        if(this.dataTable[k][nameColumn] == undefined) type = "insert";
                                        let ID = type == "insert" ? this.dataTable[k].__ID__ : this.dataTable[k][nameColumn].id;
                                        ((i) =>{
                                            this.query.protectionPost(256, { param: [ this.inputs.id, data.id, ID, nameColumn, type, 
                                                this.modal.Data[1] ? this.modal.Data[1][1].selected : null ] }, 
                                                (data) =>
                                                {
                                                    /* trace(data) */
                                                    this.dataTable[i][nameColumn] = data;
                                                    if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                                                });
                                        })(k);
                                     }
                                if(this.modal.Data[0][1].selected == "по ссылке")
                                    for(k = beginI; k <= endI; k++)
                                    {
                                        if(this.dataTable[k][nameColumn] == undefined) type = "insert";
                                        let ID = type == "insert" ? this.dataTable[k].__ID__ : this.dataTable[k][nameColumn].id;
                                        ((i) =>{
                                            this.query.protectionPost(255, { param: [ this.inputs.id, data.id, ID, nameColumn, type ] }, (data) =>
                                            {
                                                /* trace(data) */
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
                        if(this.dataTable[k][nameColumn] == undefined) type = "insert";
                        let ID = type == "insert" ? this.dataTable[k].__ID__ : this.dataTable[k][nameColumn].id;
                        ((i) =>{
                            this.query.protectionPost(255, { param: [ this.inputs.id, data.id, ID, nameColumn, type ] }, (data) =>
                            {
                                /* trace(data) */
                                this.dataTable[i][nameColumn] = data;
                                if(--length == 0) this.editTable.data = this.dataTable; // update edit table
                            });
                        })(k);
                    }
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
        /* let idRow = String(this.getID()); */
        this.update({ type: "row"/* , idRow: idRow */ });
    }
    update(property)
    {
        switch(property.type)
        {
            case "row": // Добавление строки
                this.load = true;
                this.query.protectionPost(257, { param: [ this.inputs.id/* , property.idRow */ ]}, (data) => 
                {
                    this.dataTable.push(data);
                    this.editTable.data = this.dataTable; // update edit table
                    this.load = false;
                });
                break;
            case "field": // Обновление ячейки
                this.load = true;
                this.query.protectionPost(252, { param: [ this.inputs.id,  JSON.stringify(property.out) ]}, (data) => 
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
                    this.load = false;
                });
                break;
            case "remove": // Удаление строки
                this.load = true;
                this.query.protectionPost(258, { param: [ this.inputs.id, this.dataTable[property.i].__ID__ ]}, (data) => 
                {
                    this.dataTable.splice(property.i, 1);
                    this.editTable.data = this.dataTable; // update edit table
                    this.load = false;
                });
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
                this.load = true;
                this.query.protectionPost(260, { param: [ this.inputs.id,  property.id, property.state ]}, (data) => 
                {
                    this.dataTable[property.i][property.nameColumn].state = property.state;
                    this.load = false;
                });
                break;
        }
    }
    copyField(copyOrCut)
    {
        let i = this.editTable.configInput.i;
        let j = this.editTable.configInput.j;
        localStorage.setItem("copyTable", this.editTable.listTables[i][j].id);
        localStorage.setItem("lastOperationTable", copyOrCut);

        this.rules.copy = this.rules.cut = this.rules.paste = false;
    }
    pasteField()
    {
        let i = this.editTable.configInput.i;
        let j = this.editTable.configInput.j;
        let operation = localStorage.getItem("lastOperationTable");
        let queryFunction = (typePaste) =>
        {
            this.load = true;
            this.query.protectionPost(259, { param: [this.editTable.listTables[i][j].id, localStorage.getItem("copyTable"), operation, typePaste] }, (data) =>
            {
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
    /* getID()
    {
        if(this.dataTable.length == 0) return 1;
        let max = Number(this.dataTable[0].__ID__);
        for(var i = 1; i < this.dataTable.length; i++)
            if(max < Number(this.dataTable[i].__ID__)) max = Number(this.dataTable[i].__ID__);
        return max + 1;
    } */
    compareNumeric(a, b) 
    {
        let _a = Number(a.__ID__);
        let _b = Number(b.__ID__);
        if (_a > _b) return 1;
        if (_a < _b) return -1;
    }
    searchCellId = -1; // Для отображения ячейки в таблице
    searchTimeout = null
    searchCell(id)
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
                this.inputs.searchObjectId = -1;
            }
        }, 500);
    }
}
