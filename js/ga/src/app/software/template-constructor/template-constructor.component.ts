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
    mainList = [];
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
            if(data.structure == "") this.mainList = [{ id: 1, name: "root", type: "node", bindId: -1, parent: 0, level: 0 }];
            else this.mainList = JSON.parse(data.structure);
            /* this.treeDB.load(data.structure == "" ? {} : data.structure); */
        });
    }
    saveData()
    {
        this.query.protectionPost(492, { param: [ this.id, JSON.stringify(this.mainList) ] }, (data) =>
        {
        });
        trace(this.mainList)
    }
    appendNode(i)
    {
        let Data:any = {
            title: "",  
            data: [
                ["Имя", "", "text"],
                ["Кол-во потомков", "", "text"],
                ["Тип", { selected: "node", data: ["Узел", "Таблица"], value: ["node", "table"]}, "select", { onselect: (value) =>
                {
                    if(value == "table")
                    {
                        let values = []
                        let data = [];
                        for(let i = 0; i < this.library.length; i++)
                        {
                            values[i] = this.library[i].id;
                            data[i] = this.library[i].name;
                        }
                        this.modal.Data[3] = ["Тип", {  selected: "", data: data, value: values }, "select" ];
                    }
                    else this.modal.Data.splice(3, 1);
                }}],
            ],
            ok: "Ок",
            cancel: "Отмена"
        }
        this.modal.open(Data, (save) =>
        {
            if(save)
            {
                if(Data.data[0][1] == "") return "Введите имя!";
                let name = Data.data[0][1];
                let bindId = -1;
                if(Data.data[1][1].selected == "table") 
                {
                    for(let i = 0; i < this.library.length; i++)
                        if(this.library[i].id == Data.data[2][1].selected) name += "(" + this.library[i].name + ")";
                    bindId = Data.data[2][1].selected;
                }
                // TO DO добавить проверку
                this.mainList.splice(i + 1, 0, { id: this.getId(), name: name, type: Data.data[1][1].selected, bindId: bindId, parent: this.mainList[i].parent, level: this.mainList[i].level + 1 });
            }
        });
    }
    getId()
    {
        let max = 1;
        for(let i = 0; i < this.mainList.length; i++)
            if(max < this.mainList[i].id) max = this.mainList[i].id;
        return max + 1;
    }
}