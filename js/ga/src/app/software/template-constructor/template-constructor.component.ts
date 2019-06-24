import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
@Component({
    selector: 'app-template-constructor',
    templateUrl: './template-constructor.component.html',
    styleUrls: ['./template-constructor.component.css'],
    providers: [ QueryService ]
})
export class TemplateConstructorComponent implements OnInit 
{
    @ViewChild("modal") modal;
    /* treeDB: TreeDataBase = new TreeDataBase(); */
    id = -1;
    /* mainList = []; */
    library = [];
    constructor(private query:QueryService)
    {
        let param:any = this.query.getValueBySrc(location.search);
        this.id = param.id ? Number(param.id) : -1;
    }
    ngOnInit()
    {
        this.loadData();
    }
    loadData()
    {
        this.query.protectionPost(491, { param: [ this.id ] }, (data) =>
        {
            this.query.onChange({ type: "updateClassName", id: this.id, name: data.name });
            this.library = data.lib;
            /* if(data.structure == "") this.mainList = [{ id: 1, n: "root", t: "node", p: 0, l: 0 }];
            else this.mainList = JSON.parse(data.structure); */
            /* this.treeDB.load(data.structure == "" ? {} : data.structure); */
        });
    }
    saveData()
    {
        /* this.query.protectionPost(492, { param: [ this.id, JSON.stringify(this.mainList) ] }, (data) =>
        {
        });
        trace(this.mainList) */
    }
    libraryId;
    columnList = [];
    mainFields = [
        {id: -1, name: "Наименование"},
        {id: -1, name: "Тип"}
    ]
    typeList = [];
    setFromCopy()
    {
        if(localStorage.getItem("copyExplorer"))
            this.libraryId = JSON.parse(localStorage.getItem("copyExplorer")).id;
    }
    loadLibrary()
    {
        if(this.libraryId > 0)
            this.query.protectionPost(495, { param: [ this.libraryId ] }, (data) =>
            {
                this.columnList = [];
                for(let i = 0; i < data.length; i++)
                    this.columnList.push({ id: data[i][0], name: data[i][1] });
            });
    }
    loadTypeByColumn()
    {
        this.query.protectionPost(496, { param: [ this.mainFields[1].id ] }, (data) =>
        {
            this.typeList = [];
            for(let i = 0; i < data.length; i++)
                this.typeList.push({ id: data[i].id, name: data[i].name, templateId: null, children: "none" });
        });
    }
    pasteTemplate(row)
    {
        if(localStorage.getItem("copyExplorer"))
            row.templateId = JSON.parse(localStorage.getItem("copyExplorer")).id;
    }
    /* appendNode(i, data)
    {
        let values = [];
        let _i, _j;
        for(_i = 0; _i < this.library.length; _i++)
            values[_i] = { id: this.library[_i].id, value: this.library[_i].name, check: false};
        let typeNode = 
        {
            data: ["Узел", "Таблица"],
            values: ["node", "table"]
        }
        if(this.mainList[i].t == "table")
        {
            typeNode.data = ["Таблица"];
            typeNode.values = ["table"];
        }
        let Data:any = {
            title: "",  
            data: [
                ["Имя", "", "text"],
                ["Тип", { selected: typeNode.values[0], data: typeNode.data, value: typeNode.values}, "select"],
                ["Разрешения", values, "multi-checkbox"]
            ],
            ok: "Ок",
            cancel: "Отмена"
        }
        if(data)
        {
            Data.data[0][1] = data.n;
            Data.data[1][1].selected = data.t;
            trace(data.pmt)
            for(_i = 0; _i < data.pmt.length; _i++)
                for(_j = 0; _j < values.length; _j++)
                    if(values[_j].id == data.pmt[_i])
                        values[_j].check = true;
        }
        this.modal.open(Data, (save) =>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                let name = Data.data[0][1];
                // TO DO добавить проверку
                let permit = [];
                for(_i = 0; _i < Data.data[2][1].length; _i++)
                    if(Data.data[2][1][_i].check) permit.push(Data.data[2][1][_i].id);
                if(data)
                {
                    data.n = Data.data[0][1];
                    data.t = Data.data[1][1].selected;
                    data.pmt = permit;
                }
                else this.mainList.splice(i + 1, 0, { id: this.getId(), n: name, t: Data.data[1][1].selected, pmt: permit, p: this.mainList[i].id, l: this.mainList[i].l + 1 });
                // n - name
                // t - type
                // pmt - permit
                // p - parent
                // l - level
            }
        });
    }
    removeNode(begin)
    {
        let end = begin;
        for(end = begin + 1; end < this.mainList.length; end++)
            if(this.mainList[end].l <= this.mainList[begin].l) break;
        this.mainList.splice(begin, end - begin);
    }
    getId()
    {
        let max = 1;
        for(let i = 0; i < this.mainList.length; i++)
            if(max < this.mainList[i].id) max = this.mainList[i].id;
        return max + 1;
    } */
}