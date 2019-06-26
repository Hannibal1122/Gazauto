import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
    settings:any = {};
    library = {
        name: [],
        type: []
    };
    mainList = [];
    template:any = [];
    typeByLevel = [];
    name = "";
    parent;
    @Input() set open(value)
    {
        this._open = Boolean(value);
        if(this._open === true)
        {
            this.initData();
        }
    }
    @Input() set config(value)
    {
        this.parent = value;
        if(localStorage.getItem("copyExplorer"))
            this.settings = JSON.parse(localStorage.getItem("copyExplorer"));
    }
    @Output() onChange = new EventEmitter<any>();
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
            this.name = data.name;
            trace(data)
            this.template = JSON.parse(data.structure);
            trace(this.template)
            this.mainList = [{ id: 0, name: "root", parent: -1, level: 0 }];
            this.query.protectionPost(497, { param: [ this.template.mainFields[0].id, this.template.mainFields[1].id ] }, (data) =>
            {
                this.library.name = data[this.template.mainFields[0].id];
                this.library.type = data[this.template.mainFields[1].id];
            });
            let i = 0;
            for(; i < this.template.typeList.length; i++) // Поиск первого
            {
                let j = 0;
                for(; j < this.template.typeList.length; j++)
                    if(Number[this.template.typeList[j].children] == this.template.typeList[j].id) break;
                if(j == this.template.typeList.length) break;
            }
            this.typeByLevel = [this.template.typeList[i]];
            let k = 0;
            while(k < this.template.typeList.length - 1)
                this.typeByLevel.push(this.searchFromArrayById(this.template.typeList, Number(this.typeByLevel[k++].children)));
            trace(this.typeByLevel)
            /* for(let i = 0; i < data.lib.length; i++)
                this.library[data.lib[i].id] = data.lib[i];
            this.template = JSON.parse(data.structure);
            trace(this.library)
            trace(this.template)
            this.parentList.push({ name: this.template[0].n });
            this.mapParentType.push(this.template[0].id); */
        });
    }
    searchFromArrayById(array, id)
    {
        let i = 0
        for(; i < array.length; i++) // Поиск первого
            if(array[i].id == id) break;
        return array[i];
    }
    selectParent(i)
    {
        this.createSetting.parent = i;
        this.createSetting.table = 'none';
        let type = this.typeByLevel[this.mainList[i].level].name;
        this.tableList = [];
        for(let j = 0; j < this.library.type.length; j++)
            if(this.library.type[j].name == type)
                this.tableList.push(this.library.name[j]);

    }
    inputName = "";
    createSetting = 
    {
        parent: -1,
        table: 'none'
    }
    tableList = [];
    appendNode()
    {
        if(this.createSetting.table == 'none') return;
        let i = this.createSetting.parent;
        let j = 0;
        for(; j < this.tableList.length; j++)
            if(this.tableList[j].id == Number(this.createSetting.table)) break;
        this.mainList.splice(i + 1, 0, { 
            id: this.getId(), 
            parent: this.mainList[i].id,
            name: this.tableList[j].name,
            level: this.mainList[i].level + 1,
            fieldId: this.tableList[j].id,
            templateId: this.typeByLevel[this.mainList[i].level].templateId
        });
        trace(this.mainList)
    }
    removeItem(i)
    {
        let end = i;
        for(let j = i; j < this.mainList.length; j++)
            if(this.mainList[j].level > this.mainList[i].level) end = j;
        this.mainList.splice(i, end - i + 1);
        this.clearSelect();
    }
    clearSelect()
    {
        this.createSetting.parent = -1;
        this.createSetting.table = 'none';
    }
    Cancel()
    {
        this.onChange.emit();
    }
    Create()
    {
        this.query.protectionPost(493, { param: [ JSON.stringify(this.mainList), this.parent ] }, (data) =>
        {
            trace(data)
        });
    }
    getId()
    {
        let max = 0;
        for(let i = 0; i < this.mainList.length; i++)
            if(this.mainList[i].id > max) max = this.mainList[i].id;
        return max + 1;
    }
}