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
            trace(data)
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
    addRow()
    {
        if(this.dataHeader.length == 0) 
        {
            this.modal.open({ title: "Нужно добавить заголовок!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        let idRow = String(this.getID());
        let out = [];
        let i = this.dataTable.length;
        this.dataTable[i] = {__ID__: idRow};
        for(var j = 0; j < this.dataHeader.length; j++)
        {
            out[j] = 
            {
                __ID__: idRow, 
                __type__: "insert"
            }
            out[j][this.dataHeader[j].value] = "";
            this.dataTable[i][this.dataHeader[j].value] = "";
        }
        this.editTable.data = this.dataTable; // update edit table
        this.update({out: out});
    }
    appendFromLeftMenu = (() =>
    {
        return (i, j, data) =>
        {
            let nameColumn = "";
            let type = "update";
            for(var _i = 0; _i < this.dataHeader.length; _i++)
                if(this.dataHeader[_i].i == j) { nameColumn = this.dataHeader[_i].value; break; }
            if(this.dataTable[i][nameColumn] == undefined) type = "insert";
            this.query.protectionPost(255, { param: [ this.inputs.id, data.id, this.dataTable[i].__ID__, nameColumn, type ] }, (data) =>
            {
                /* trace(i + " " + j) */
                trace(data)
                this.dataTable[i][nameColumn] = data;
                this.editTable.data = this.dataTable; // update edit table
            /* trace(this.dataHeader)
                trace(this.dataTable)
                trace(this.dataTable[i].__ID__) */
            });
        }
    })();
    update(data)
    {
        let out = data.out;
        if(data.type == "remove")
        {
            out = [];
            for(var j = 0; j < this.dataHeader.length; j++)
            {
                let value = this.dataTable[data.idRow][this.dataHeader[j].value];
                out[j] = 
                {
                    __ID__: this.dataTable[data.idRow].__ID__, 
                    __type__: "remove"
                }
                out[j][this.dataHeader[j].value] = value.type ? JSON.stringify(value) : value;
            }
            trace(out)
            this.dataTable.splice(data.idRow, 1);
            this.editTable.data = this.dataTable; // update edit table
        }
        this.query.protectionPost(252, { param: [ this.inputs.id,  JSON.stringify(out) ]}, (data) => 
        {
            /* trace(data) */
        });
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