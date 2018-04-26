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
        remove: true,
        add: true,
    }
    constructor(private query:QueryService) { }
    changeHeader()
    {
        var header = [];
        for(var i = 0; i < this.dataHeader.length; i++) header[i] = this.dataHeader[i];
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
                    out.push({ value: Data.data[0][1][i].value, i: i});
                let changes = Data.data[0][3];
                this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(out), JSON.stringify(out) ]}, (data) => 
                {
                    trace("inserting header")
                    this.dataHeader = Data.data[0][1];
                    trace(data)
                });
                
            }
        });
    }
    update(type, data, e)
    {
        if(type == "inserting") data.ID = this.getID();
        
        var promise = new Promise((resolve, reject) => 
        {
            setTimeout(() =>
            {
                trace("point 1")
                switch(type)
                {
                    case "inserting":
                        /* this.query.protectionPost(251, { param: [ this.inputs.id, JSON.stringify(data) ]}, (data) => 
                        {
                            trace("inserting")
                            trace(data)
                        }); */
                        /* if(this.dataHeader.length == 0) this.modal.open({ title: "Создайте сначала заголовок!", data: [], ok: "Ok", cancel: "" }); */
                        resolve(true);
                        e.component.cancelEditData();
                        break;
                    case "insert":
                        break;
                    case "update":
                        break;
                    case "remove":
                        break;
                }
            }, 20);
            /* setTimeout(() => {
                resolve();
            }, 3000); */
        
        });
        trace("point 2")
        e.cancel = promise;
        trace("point 3")
        trace(type)
        trace(data)
        trace(e)
    }
    getID()
    {
        this.dataTable.sort(this.compareNumeric);
        for(var i = 0; i < this.dataTable.length; i++)
            if(i + 1 != Number(this.dataTable[i].ID))
                return i + 1;
        return i + 1;
    }
    compareNumeric(a, b) 
    {
        let _a = Number(a.ID);
        let _b = Number(b.ID);
        if (_a > _b) return 1;
        if (_a < _b) return -1;
    }
    onCellPrepared(e) 
    {
        if (e.rowType === "data" && e.column.command === "edit") 
        {
            let cellElement = e.cellElement;
            let deleteLink = cellElement.querySelector(".dx-link-delete");
            deleteLink.classList.add("dx-icon-trash");
            deleteLink.textContent = "";
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
            for(var i = 0; i < data.head.length; i++)
                this.dataHeader.push({ i: data.head[i][0], value: data.head[i][1] });
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
