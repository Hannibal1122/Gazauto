import { Component, OnInit, Input } from '@angular/core';
import { QueryService } from "../../lib/query.service";

declare var trace:any;
@Component({
    selector: 'app-create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css'],
    providers: [ QueryService ]
})
export class CreateTemplateComponent implements OnInit 
{
    _open = false;
    parent = -1;
    settings:any = {};
    library = {};
    mainList = [];
    template = [];
    @Input() set open(value)
    {
        this._open = Boolean(value);
        if(this._open === true)
        {
            trace(this.parent)
            trace(this.settings)
            this.initData();
        }
    }
    @Input() set config(value)
    {
        this.parent = value;
        if(localStorage.getItem("copyExplorer"))
            this.settings = JSON.parse(localStorage.getItem("copyExplorer"));
    }
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
    }
    mapParentType = [];
    initData()
    {
        this.query.protectionPost(491, { param: [ this.settings.id ] }, (data) =>
        {
            for(let i = 0; i < data.lib.length; i++)
                this.library[data.lib[i].id] = data.lib[i];
            this.template = JSON.parse(data.structure);
            trace(this.library)
            trace(this.template)
            this.parentList.push({ name: this.template[0].n });
            this.mapParentType.push(this.template[0].id);
            /* this.treeDB.load(data.structure == "" ? {} : data.structure); */
        });
    }
    appendNode()
    {
        this.parentList.push({ name: this.createSetting.name });
        this.mapParentType.push(Number(this.createSetting.type));
        let i = 0;
        for(; i < this.mainList.length; i++)
            if(this.mainList[i].id == Number(this.createSetting.parent)) break;
        this.mainList.splice(i, 0, { 
            id: this.mapParentType.length - 1, 
            name: this.createSetting.name,
            parent: Number(this.createSetting.parent)
        });
        trace(this.mainList)
    }
    createSetting = 
    {
        name: "",
        parent: 'none',
        type: 'none',
        table: 'none'
    }
    parentList = [];
    typeList = [];
    tableList = [];
    onChangeParentList()
    {
        this.typeList = this.getTypeByParent(this.mapParentType[Number(this.createSetting.parent)]);
    }
    onChangeTypeList()
    {
        this.tableList = this.getTableByType(Number(this.createSetting.type));
    }
    getTypeByParent(parent)
    {
        let out = [];
        for(let i = 0; i < this.template.length; i++)
            if(this.template[i].p == parent) 
                out.push({ id: this.template[i].id, name: this.template[i].n });
        trace(out)
        return out;
    }
    getTableByType(id)
    {
        let out = [];
        for(let i = 0; i < this.template.length; i++)
            if(this.template[i].id == id) 
                for(let j = 0; j < this.template[i].pmt.length; j++)
                    out.push(this.library[this.template[i].pmt[j]]);
        trace(out)
        return out;
    }
}