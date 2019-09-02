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
    removeItems = [];

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
        
        /* trace(this.folder)
        trace(this.settings) */
        this.listTemplateById = {};
        this.removeItems = [];
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
                    for(let i = 1; i < this.myClass.length; i++) // Выставление имени для шаблонов
                    {
                        // Сортировка типов идет по parent шаблона!
                        this.myClass[i].templateName = listNames[this.myClass[i].templateId];
                        if(this.listTemplateById[this.myClass[i].parent] == undefined) this.listTemplateById[this.myClass[i].parent] = [];
                        this.listTemplateById[this.myClass[i].parent].push(this.myClass[i]);
                        if(this.lastLevel < this.myClass[i].level) this.lastLevel = this.myClass[i].level
                    }
                    /* trace(this.myClass) */
                    this.query.protectionPost(494, { param: [ this.folder !== null ? this.folder.id : -1 ] }, (data) =>
                    {
                        trace(data.structure)
                        if(this.folder !== null) this.myTree.data = data.structure;
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
        if(!this.mainList[i].edited) return;
        if(this.mainList[i].templateId === -1) return;
        this.myTree.push(this.mainList[i].id, { 
            name: "", 
            templateId: -1, // id из базы данных
            templateTreeId: -1, // id из массива myClass
            templateParentId: this.mainList[i].templateId === undefined ? 1 : this.mainList[i].templateTreeId, // Для root
            edited: true,
            level: this.mainList[i].level, 
            last: this.lastLevel == this.mainList[i].level + 1 ? true : false 
        });
        this.mainList = this.myTree.straighten();
    }
    removeItem(i)
    {
        if(!this.mainList[i].edited) return;
        if(this.mainList[i].globalId) this.removeItems.push(this.mainList[i].globalId);
        this.myTree.remove(this.mainList[i].id);
        this.mainList = this.myTree.straighten();
    }
    onChangeTemplate(i)
    {
        let myTreeElement = this.myTree.getElement(this.mainList[i].id);
        let j = 0;
        for(; j < this.myClass.length; j++)
            if(this.myClass[j].id == this.mainList[i].templateTreeId) break;

        this.mainList[i].templateId = this.myClass[j].templateId; // т.к. не делается выпрямление
        myTreeElement.templateTreeId = Number(this.mainList[i].templateTreeId);
        myTreeElement.templateId = this.myClass[j].templateId;
        myTreeElement.templateParentId = this.myClass[j].parent;
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
        this.query.protectionPost(493, { param: [ 
            JSON.stringify(this.mainList), 
            JSON.stringify(this.myTree.data), 
            this.parent, 
            this.settings.id, 
            this.settings.new,
            this.removeItems 
        ] }, (data) =>
        {
            this.loaded = true;
            this.Cancel("update");
        });
    }
}