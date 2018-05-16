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

    inputs = { id: -1 };
    firstData = {};
    dataHeader = [];
    dataTable = [];
    mode = "Local";
    nameTable = "";
    error = false;
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
    }
    loadTable()
    {
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
            for(var key in data.data)
            {
                let i = this.dataTable.length;
                this.dataTable[i] = data.data[key];
                this.dataTable[i].__ID__ = key;
            }
        });
    }
    changeNameTable()
    {
        this.query.protectionPost(253, { param: [this.inputs.id, this.nameTable]}, (data) => { });
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
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out), changes ]}, (data) => 
                {
                    this.dataHeader = [];
                    for(var i = 0; i < Data.data[0][1].length; i++)
                        this.dataHeader[i] = { value: Data.data[0][1][i].value, i: i };

                    this.editTable.head = this.dataHeader; // update edit table
                    this.editTable.data = this.dataTable; // update edit table
                });
            }
        });
    }
    appendFromLeftMenu = (() => // Добавление из леаого меню
    {
        return (i, j, data) =>
        {
            let nameColumn = "";
            let type = "update";
            for(var _i = 0; _i < this.dataHeader.length; _i++)
                if(this.dataHeader[_i].i == j) { nameColumn = this.dataHeader[_i].value; break; }
            if(this.dataTable[i][nameColumn] == undefined) type = "insert";
            let ID = type == "insert" ? this.dataTable[i].__ID__ : this.dataTable[i][nameColumn].id;
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
                                    this.query.protectionPost(256, { param: [ this.inputs.id, data.id, ID, nameColumn, type, 
                                        this.modal.Data[1] ? this.modal.Data[1][1].selected : null ] }, 
                                        (data) =>
                                        {
                                            trace(data)
                                            this.dataTable[i][nameColumn] = data;
                                            this.editTable.data = this.dataTable; // update edit table
                                        });
                                if(this.modal.Data[0][1].selected == "по ссылке")
                                {
                                    this.query.protectionPost(255, { param: [ this.inputs.id, data.id, ID, nameColumn, type ] }, (data) =>
                                    {
                                        trace(data)
                                        this.dataTable[i][nameColumn] = data;
                                        this.editTable.data = this.dataTable; // update edit table
                                    });
                                }
                            }
                        });
                    });
                    break;
                case "table": 
                    this.query.protectionPost(255, { param: [ this.inputs.id, data.id, ID, nameColumn, type ] }, (data) =>
                    {
                        trace(data)
                        this.dataTable[i][nameColumn] = data;
                        this.editTable.data = this.dataTable; // update edit table
                    });
                    break;
            }
            trace(data)
        }
    })();
    addRow()
    {
        if(this.dataHeader.length == 0) 
        {
            this.modal.open({ title: "Нужно добавить заголовок!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        let idRow = String(this.getID());
        this.update({ type: "row", idRow: idRow });
    }
    update(property)
    {
        switch(property.type)
        {
            case "row":
                this.query.protectionPost(257, { param: [ this.inputs.id, property.idRow ]}, (data) => 
                {
                    this.dataTable.push(data);
                    this.editTable.data = this.dataTable; // update edit table */
                });
                break;
            case "field":
                this.query.protectionPost(252, { param: [ this.inputs.id,  JSON.stringify(property.out) ]}, (data) => 
                {
                    if(property.out.__type__ == "insert")
                        this.dataTable[property.i][property.nameColumn] = data;
                    else 
                        if(typeof data.value === "object")
                        {
                            this.dataTable[property.i][property.nameColumn].listValue = data.value.listValue;
                            this.dataTable[property.i][property.nameColumn].value = data.value.value;
                        }
                        else this.dataTable[property.i][property.nameColumn] = data;
                    this.editTable.data = this.dataTable; // update edit table */
                });
                break;
            case "remove":
                this.query.protectionPost(258, { param: [ this.inputs.id, this.dataTable[property.i].__ID__ ]}, (data) => 
                {
                    this.dataTable.splice(property.i, 1);
                    this.editTable.data = this.dataTable; // update edit table */
                });
                break;
            case "operation":
                this.rules.copy = property.rules.copy;
                this.rules.cut = property.rules.cut;
                this.rules.paste = property.rules.paste;
                break;
            case "explorer":
                trace(property.linkId)
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
    pasteField(copyOrCut)
    {
        let i = this.editTable.configInput.i;
        let j = this.editTable.configInput.j;
        this.query.protectionPost(259, { param: [this.editTable.listTables[i][j].id, localStorage.getItem("copyTable"), localStorage.getItem("lastOperationTable")] }, (data) =>
        {
            this.editTable.listTables[i][j] = data;
        });
        localStorage.removeItem("copyTable");
        this.rules.copy = this.rules.cut = this.rules.paste = false;
    }
    getID()
    {
        if(this.dataTable.length == 0) return 1;
        let max = Number(this.dataTable[0].__ID__);
        for(var i = 1; i < this.dataTable.length; i++)
            if(max < Number(this.dataTable[i].__ID__)) max = Number(this.dataTable[i].__ID__);
        return max + 1;
    }
    compareNumeric(a, b) 
    {
        let _a = Number(a.__ID__);
        let _b = Number(b.__ID__);
        if (_a > _b) return 1;
        if (_a < _b) return -1;
    }
}
