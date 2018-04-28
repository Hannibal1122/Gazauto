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
    
    inputs = { id: -1 };
    firstData = {};
    dataHeader = [];
    dataTable = [];
    mode = "Local";
    rules = 
    {
        save: true,
        head: true, 
        cut: true, 
        copy: true, 
        paste: true,
        add: true,
        remove: true,
    }
    constructor(private query:QueryService) { }
    changeHeader()
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
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out) ]}, (data) => 
                {
                    this.dataHeader = [];
                    for(var i = 0; i < Data.data[0][1].length; i++)
                        this.dataHeader[i] = { value: Data.data[0][1][i].value, i: i };
                });
            }
        });
    }
    addCount = 0;
    queueQuery = [];
    update(type, data, e)
    {
        if(type == "inserting") data.__ID__ = String(this.getID());
        
        var promise;
        e.cancel = promise;
        promise = new Promise((resolve, reject) => 
        {
            /* setTimeout(() =>
            { */
                switch(type)
                {
                    case "inserting":
                        this.addCount++;
                        this.addToQueueQuery(data, data.__ID__, "insert");
                        /* resolve(true);
                        e.component.cancelEditData(); */
                        break;
                    case "updating":
                        this.addCount++;
                        this.addToQueueQuery(e.newData, e.key, "update");
                        break;
                    case "removing":
                        this.addCount++;
                        this.addToQueueQuery(data, e.key, "remove");
                        break;
                    case "insert":
                    case "update":
                    case "remove":
                        this.addCount--;
                        trace(this.queueQuery)
                        if(this.addCount == 0)
                            this.query.protectionPost(252, { param: [ this.inputs.id, JSON.stringify(this.queueQuery) ]}, (data) => 
                            {
                                trace(data)
                                this.queueQuery = [];
                            });
                        break;
                }
            /* }, 20); */
            /* setTimeout(() => {
                resolve();
            }, 3000); */
        
        });
    }
    addToQueueQuery(data, id, type)
    {
        for(var key in data)
            if(key != "__ID__" && key != "__type__")
            {
                let i = this.queueQuery.length;
                this.queueQuery[i] = {};
                this.queueQuery[i][key] = data[key];    
                this.queueQuery[i].__ID__ = id;
                this.queueQuery[i].__type__ = type;
                if(type == "update" && this.firstData[id][key] == undefined)
                    this.queueQuery[i].__type__ = "insert"; 
            }
    }
    getID()
    {
        this.dataTable.sort(this.compareNumeric);
        trace(this.dataTable)
        for(var i = 0; i < this.dataTable.length; i++)
            if(i + 1 != Number(this.dataTable[i].__ID__))
                return i + 1;
        return i + 1;
    }
    compareNumeric(a, b) 
    {
        let _a = Number(a.__ID__);
        let _b = Number(b.__ID__);
        if (_a > _b) return 1;
        if (_a < _b) return -1;
    }
    onCellPrepared(e) 
    {
        if (e.rowType === "data" && e.column.command === "edit") 
        {
            let cellElement = e.cellElement;
            let deleteLink = cellElement.querySelector(".dx-link-delete");
            if(deleteLink)
            {
                deleteLink.classList.add("dx-icon-trash");
                deleteLink.textContent = "";
            }
        }
    }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
        this.loadTable();
    }
    loadTable()
    {
        this.query.protectionPost(250, { param: [this.inputs.id]}, (data) => 
        {
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
            trace(this.dataTable)
            trace(data)
        });
    }

    height = 0;
    functionResize;
    resize()
    {
        this.height = document.documentElement.clientHeight - 100;
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
    }
}
