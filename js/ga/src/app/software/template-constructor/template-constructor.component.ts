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
    inputs:any = {};
    id = -1;
    library = [];
    constructor(private query:QueryService) { }
    ngOnInit()
    {
        this.id = this.inputs.id;
        this.loadData();
    }
    loadData()
    {
        this.query.protectionPost(491, { param: [ this.id ] }, (data) =>
        {
            this.query.onChange({ type: "updateClassName", id: this.id, name: data.name });
            this.library = data.lib;
            if(data.structure != "")
            {
                let loadData = JSON.parse(data.structure);
                this.libraryId = loadData.libraryId;
                this.loadLibrary(() => {
                    this.mainFields = loadData.mainFields;
                    this.loadTypeByColumn(() => {
                        for(let i = 0; i < this.typeList.length; i++)
                            for(let j = 0; j < loadData.typeList.length; j++)
                                if(this.typeList[i].name == loadData.typeList[j].name)
                                {
                                    this.typeList[i].templateId = loadData.typeList[j].templateId;
                                    this.typeList[i].children = loadData.typeList[j].children;
                                    this.typeList[i].templateColumn = loadData.typeList[j].templateColumn;
                                }
                    })
                })
            }
        });
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
    loadLibrary(func?)
    {
        if(this.libraryId > 0)
            this.query.protectionPost(495, { param: [ this.libraryId ] }, (data) =>
            {
                this.columnList = [];
                for(let i = 0; i < data.length; i++)
                    this.columnList.push({ id: data[i][0], name: data[i][1] });
                if(func) func();
            });
    }
    loadTypeByColumn(func?)
    {
        this.query.protectionPost(496, { param: [ this.mainFields[1].id ] }, (data) =>
        {
            this.typeList = [];
            for(let i = 0; i < data.length; i++)
                this.typeList.push({ name: data[i], templateId: null, children: "none", templateColumn: [] });
            if(func) func();
        });
    }
    pasteTemplate(row)
    {
        if(localStorage.getItem("copyExplorer"))
            row.templateId = JSON.parse(localStorage.getItem("copyExplorer")).id;
    }
    loadTemplate(row)
    {
        this.query.protectionPost(495, { param: [ row.templateId ] }, (data) =>
        {
            row.templateColumn = [];
            for(let i = 0; i < data.length; i++)
                row.templateColumn.push({ id: data[i][0], name: data[i][1] });
        });
    }
    saveData()
    {
        let save = JSON.stringify({
            libraryId: this.libraryId,
            mainFields: this.mainFields,
            typeList: this.typeList
        });
        this.query.protectionPost(492, { param: [ this.id, save ] }, (data) =>
        {
        });
    }
}