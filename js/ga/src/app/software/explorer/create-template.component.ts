import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryService } from "../../lib/query.service";
import { MyTree } from '../template-constructor/my-tree.service';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';

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
    animationOpen = false;
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
    cutElement = -1;

    listTemplateById = {};
    @Input() set config(value)
    {
        if(value)
        {
            this.parent = value.parent;
            this.folder = value.folder;

            if(Boolean(value.open))
            {
                this._open = true;
                this.animationOpen = false;
                this.initData();
                setTimeout(() => {
                    this.animationOpen = true;
                }, 50);
            }
            else this.animationOpen = false;
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
                    for(let i = 0; i < this.myClass.length; i++) // Выставление имени для шаблонов
                    {
                        // Сортировка типов идет по parent шаблона!
                        this.myClass[i].templateName = this.myClass[i].name || listNames[this.myClass[i].templateId];
                        if(this.listTemplateById[this.myClass[i].parent] == undefined) this.listTemplateById[this.myClass[i].parent] = [];
                        this.listTemplateById[this.myClass[i].parent].push(this.myClass[i]);
                        if(this.lastLevel < this.myClass[i].level) this.lastLevel = this.myClass[i].level
                    }
                    /* trace(this.myClass) */
                    this.query.protectionPost(494, { param: [ this.folder !== null ? this.folder.id : -1 ] }, (data) =>
                    {
                        if(this.folder !== null) this.myTree.data = data.structure;
                        else 
                            this.myTree.push(0, { name: "root", edited: true, templateId: this.listTemplateById[0][0].templateId, templateTreeId: this.listTemplateById[0][0].id, templateParentId: 0 });
                        this.mainList = this.myTree.straighten();
                        /* trace(this.mainList) */
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
        if(!this.mainList[i].edited/*  && i > 0 */) return;
        if(this.mainList[i].templateId === -1) return;
        this.myTree.push(this.mainList[i].id, { 
            name: "", 
            templateId: -1, // id из базы данных
            templateTreeId: -1, // id из массива myClass
            templateParentId: this.mainList[i].templateId === undefined ? 1 : this.mainList[i].templateTreeId, // Для root
            edited: true,
            open: true,
            hide: false,
            level: this.mainList[i].level, 
            last: this.lastLevel == this.mainList[i].level + 1 ? true : false 
        });
        this.mainList = this.myTree.straighten();
    }
    openCollapse(i)
    {
        let begin = this.mainList[i].level + 1;
        let open = !this.mainList[i].open;
        let elem = this.myTree.getElement(this.mainList[i].id);
        this.mainList[i].open = open; 
        elem.open = open;
        for(let _i = i + 1; _i < this.mainList.length; _i++)
            if(this.mainList[_i].level < begin) break;
            else 
            {
                elem = this.myTree.getElement(this.mainList[_i].id);
                if(!open) 
                {
                    this.mainList[_i].open = false; // если закрываем
                    this.mainList[_i].hide = true; // если закрываем
                    elem.open = false;
                    elem.hide = true;
                }
                else if(this.mainList[_i].level == begin) 
                {
                    this.mainList[_i].hide = false; // если открываем
                    elem.hide = false;
                }
            }
    }
    setCutElement(i)
    {
        this.cutElement = i;
    }
    pasteCutElement(i)
    {
        this.loaded = false;
        let cutElement = this.myTree.getElement(this.mainList[this.cutElement].id);
        //Применить функцию вырезать 
        this.query.protectionPost(495, { param: [ cutElement.globalId, this.mainList[i].globalId ] }, (errors) => {
            // В ответ могут прийти только ошибки
            this.error = "";
            if(Array.isArray(errors))
            {
                for(let i = 0; i < errors.length; i++)
                    this.error += (errors[i] == "ERROR_IN_ITSELF" ? "Конечная папка является дочерней для копируемой!" : "Неизвестная ошибка!");
                this.loaded = true;
                return;
            }
            cutElement.parent = this.mainList[i].id;
            //Сохранить новую структуру
            this.query.protectionPost(496, { param: [ this.folder.id, JSON.stringify(this.myTree.data) ] }, (data) => {
                this.mainList = this.myTree.straighten();
                this.loaded = true;
            });
        });
        this.cutElement = -1;
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
    animationCloseModal()
    {
        if(this.animationOpen == false)
            this._open = false;
    }
    loaded = true;
    error = "";
    Create()
    {
        // Отправляем 1 - структура для создания дирректории
        // 2 - дерево этой структуры
        // 3 - родительская дирректория
        // 4 - id класса
        let error = false;
        this.error = "";
        for(let i = 0; i < this.myTree.data.length; i++)
            if(this.myTree.data[i].templateId === -1) error = true;
        if(error)
        {
            this.error = "Не выставлен шаблон!";
            return;
        }
        this.loaded = false;
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