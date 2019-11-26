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
    name = "";
    parent;
    folder;
    mainList = [];
    myTree:MyTree;
    myClass = [];
    myClassTree:MyTree;
    cutElement = -1;
    mapForTemplate = {};

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
        let id = this.folder.id;
        let classId = this.folder.bindId;
        
        this.mainList = [];
        this.myTree = new MyTree();
        this.myClass = [];
        this.myClassTree = new MyTree();
        this.mapForTemplate = {};

        this.query.protectionPost(491, { param: [ classId ] }, (data) => // Загрузка класса
        {
            trace(classId)
            trace(id)
            this.name = data.name;
            if(data.structure)
            {
                this.myClassTree.data = JSON.parse(data.structure);
                this.myClass = this.myClassTree.straighten();
                let mapClass = {};
                for(let i = 0; i < this.myClass.length; i++)
                    mapClass[this.myClass[i].id] = this.myClass[i];
                trace(this.myClass)
                this.query.protectionPost(494, { param: [ id ] }, (classesBind) => // Загрузка связей
                {
                    for(let key in classesBind)
                        this.mapForTemplate[classesBind[key].globalId] = { ...mapClass[key ? key : 1], edited: classesBind[key].edited }  // В 494 запросе нулевой ключ пустой, а нумерация начинается с 1
                    trace(this.mapForTemplate)
                    this.query.protectionPost(113, { param: [ id ] }, (data) => // Загрузка структуры
                    {
                        let tree = {
                            bindId: -1,
                            childrens: data,
                            classId: null,
                            id: this.folder.id,
                            name: this.name,
                            parent: -1,
                            state: 0,
                            type: "table"
                        }
                        let outData = [];
                        this.straighten(outData, tree, 0, -1);
                        this.myTree.data = outData;
                        this.mainList = this.myTree.straighten();
                        trace(tree)
                        trace(outData)
                    })
                })
            }
        });
    }
    straighten(out, data, level, parent) // из объекта получаем одномерный массив со всеми полями дерева
    {
        let childrens = data.childrens;
        let j = out.length;
        out[j] = {
            id: data.id, 
            name: data.name, 
            objectType: data.type, 
            bindId: data.bindId, 
            classId: data.classId, 
            state: data.state, 
            level: level, 
            hide: !(level <= 0), 
            open: false, 
            parent: parent 
        };
        level++;
        if(childrens.length == 0) out[j].end = true;
        else
            for(j = 0; j < childrens.length; j++)
                this.straighten(out, childrens[j], level, data.id);
    }
    inputName = "";
    appendNode(i)
    {
        /* if(!this.mainList[i].edited) return;
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
        this.mainList = this.myTree.straighten(); */
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
        
    }
    onChangeTemplate(i)
    {
        
    }
    onChangeName(i)
    {
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
    seacrhElement(templateId)
    {
        this.query.onChange({ type: "openFromTable", value: { name: "table", id: templateId }});
    }
    loaded = true;
    error = "";
    Create()
    {
        // Отправляем 1 - структура для создания дирректории
        // 2 - дерево этой структуры
        // 3 - родительская дирректория
        // 4 - id класса
        /* let error = false;
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
            this.settings.new
        ] }, (data) =>
        {
            this.loaded = true;
            this.Cancel("update");
        }); */
    }
}