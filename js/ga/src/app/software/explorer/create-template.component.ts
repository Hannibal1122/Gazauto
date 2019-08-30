import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { MyTree } from '../template-constructor/my-tree.service';

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
    name = "";
    parent;
    folder;
    mainList = [];
    myTree:MyTree;
    myClass = [];
    myClassTree:MyTree;
    lastLevel = 0;
    
    listTemplateById = {};
    @Input() set config(value)
    {
        if(value)
        {
            this._open = Boolean(value.open);
            this.parent = value.parent;
            this.folder = value.folder;
            if(this._open === true)
            {
                this.initData();
            }
        }
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
        this.loaded = false;
        if(this.folder !== null) 
        {
            this.settings.id = this.folder.bindId;
            this.settings.new = false;
        }
        else
            if(localStorage.getItem("copyExplorer"))
                this.settings = JSON.parse(localStorage.getItem("copyExplorer"));
        
        trace(this.folder)
        trace(this.settings)
        this.listTemplateById = {};
        this.mainList = [];
        this.myTree = new MyTree();
        this.myClass = [];
        this.myClassTree = new MyTree();
        this.query.protectionPost(491, { param: [ this.settings.id ] }, (data) =>
        {
            this.name = data.name;
            if(data.structure)
            {
                this.myClassTree.data = JSON.parse(data.structure);
                this.myClass = this.myClassTree.straighten();
                this.query.protectionPost(497, { param: [ this.myClass ] }, (listNames) =>
                {
                    for(let i = 1; i < this.myClass.length; i++)
                    {
                        this.myClass[i].templateName = listNames[this.myClass[i].templateId];
                        if(this.listTemplateById[this.myClass[i].parent] == undefined) this.listTemplateById[this.myClass[i].parent] = [];
                        this.listTemplateById[this.myClass[i].parent].push(this.myClass[i]);
                        if(this.lastLevel < this.myClass[i].level) this.lastLevel = this.myClass[i].level
                    }
                    trace(this.listTemplateById)
                    this.query.protectionPost(494, { param: [ this.folder !== null ? this.folder.id : -1 ] }, (data) =>
                    {
                        if(this.folder !== null) this.myTree.data = JSON.parse(data.structure);
                        else this.myTree.push(-1, { name: "root" });
                        this.mainList = this.myTree.straighten();
                        this.loaded = true;
                    });
                });
            }
            else trace("Error!");
        });
    }
    inputName = "";
    appendNode(i)
    {
        this.myTree.push(this.mainList[i].id, { 
            name: "", 
            templateId: -1, 
            level: this.mainList[i].level, 
            last: this.lastLevel == this.mainList[i].level + 2 ? true : false 
        });
        this.mainList = this.myTree.straighten();
    }
    removeItem(i)
    {
        trace(this.mainList[i].globalId)
        trace(this.mainList[i].rowId)
        /* this.myTree.remove(this.mainList[i].id);
        this.mainList = this.myTree.straighten();
        this.clearSelect(); */
    }
    onChangeTemplate(i)
    {
        this.myTree.getElement(this.mainList[i].id).templateId = this.mainList[i].templateId;
    }
    onChangeName(i)
    {
        this.myTree.getElement(this.mainList[i].id).name = this.mainList[i].name;
    }
    Cancel(e?)
    {
        this.onChange.emit(e);
    }
    loaded = true;
    Create()
    {
        this.loaded = false;
        /* if(this.inputName != "") this.mainList[0].name = this.inputName; */
        // Отправляем 1 - структура для создания дирректории
        // 2 - дерево этой структуры
        // 3 - родительская дирректория
        // 4 - id класса
        this.query.protectionPost(493, { param: [ JSON.stringify(this.mainList), JSON.stringify(this.myTree.data), this.parent, this.settings.id, this.settings.new ] }, (data) =>
        {
            this.loaded = true;
            this.Cancel("update");
        });
    }
}