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
    modal;
    parent;
    object;
    classList = {};
    classBind = {};
    mainList = [];
    myTree:MyTree;
    cutElement = -1;
    loaded = true;
    error = "";
    openCloseElement = {}; // сохраняет открытые/закрытые группы // сохраняет по глобальному id
    mapParentType = [];

    @Input() set config(value)
    {
        if(value)
        {
            this.parent = value.parent;
            this.object = value.object;
            this.modal = value.modal;
            if(this.object && this.openCloseElement[this.object.id] === undefined)
                this.openCloseElement[this.object.id] = {};
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
    constructor(private query:QueryService) { }
    ngOnInit() { }
    initData()
    {
        this.loaded = false;
        let id = this.object.id;
        let classId = this.object.classId || this.object.bindId // необходимо для поддержки старой версии
        
        this.mainList = [];
        this.myTree = new MyTree();

        this.query.protectionPost(133, { param: [ id ] }, (data) => // Загрузка таблицы требований
        {
            let userProperty = JSON.parse(data.userProperty);
            this.demandTable = null;
            if(userProperty)
                for(let i = 0; i < userProperty.length; i++)
                    if(userProperty[i].type == "annotation")
                    {
                        this.demandTable = userProperty[i].value.id;
                        break;
                    }
            this.query.protectionPost(498, { param: [ classId ] }, (data) => // Загрузка класса с подклассами
            {
                this.classList = {};
                for(let key in data.structures)
                    this.classList[key] = new MyClass(data.structures[key]);

                this.query.protectionPost(113, { param: [ id ] }, (data) => // Загрузка структуры
                {
                    let tree = {
                        childrens: data,
                        edited: true,
                        hide: false,
                        open: false,
                        ...this.object
                    }
                    let outData = [];
                    this.straighten(outData, tree, 0, -1);

                    // Если есть сохраненные значения hide/open
                    let openCloseElement = this.openCloseElement[this.object.id];
                    for(let i = 0; i < outData.length; i++)
                        if(openCloseElement[outData[i].id])
                        {
                            outData[i].hide = openCloseElement[outData[i].id].hide;
                            outData[i].open = openCloseElement[outData[i].id].open;
                        }
                        else
                            if(i > 0)
                            {
                                outData[i].hide = true;
                                outData[i].open = false;
                            }
                    this.myTree.data = outData;

                    // Прописываем имена шаблонов и их id в классе
                    this.query.protectionPost(494, { param: [ id ] }, (classBind) => // Загрузка связей уже созданной структуры
                    {
                        this.classBind = classBind;
                        for(let i = 0; i < this.myTree.data.length; i++) // дозаполняем массив информацией
                        {
                            let object = this.myTree.data[i];
                            if(classBind[object.id] === undefined)
                            {
                                object.gap = true;
                                continue;
                            }
                            let _class = this.classList[classBind[object.id].classId];
                            let element = _class.map[classBind[object.id].treeId];
                            object.demandId = classBind[object.id].demandId;
                            object.edited = classBind[object.id].edited;
                            object.templateId = element.templateId;
                            object.templateName = element.name || element.templateName;
                            object.templateType = element.templateType;
                        }
                        this.mainList = this.myTree.straighten();
                        this.loaded = true;
                    })
                })
            });
        })
    }
    straighten(out, data, level, parent) // из объекта получаем одномерный массив со всеми полями дерева
    {
        let childrens = data.childrens;
        let j = out.length;
        out[j] = {
            id: data.id, 
            name: data.name, 
            objectType: data.objectType, 
            bindId: data.bindId, 
            classId: data.classId, 
            state: data.state, 
            edited: data.edited, 
            level: level, 
            hide: data.hide, 
            open: data.open, 
            parent: parent/* ,
            _parent: data.parent */
        };
        level++;
        if(childrens.length > 0)
            for(j = 0; j < childrens.length; j++)
                this.straighten(out, childrens[j], level, data.id);
    }
    appendNode(i)
    {
        let object = this.mainList[i];
        if(this.classBind[object.id] === undefined || !object.edited)
        {
            this.modal.open({ title: "Невозможно добавить элемент!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        let openCloseElement = this.openCloseElement[this.object.id];
        let listData = [];
        let listValue = [];
        let listTemplate = [];
        let _class = this.classList[this.classBind[object.id].classId];
        _class.tree.getChildren(listTemplate, { id: this.classBind[object.id].treeId });
        for(let i = 0; i < listTemplate.length; i++)
        {
            listData[i] = listTemplate[i].name || listTemplate[i].templateName;
            listValue[i] = listTemplate[i].id;
        }
        let Data:any = {
            title: "Добавить элемент",  
            data: [
                [ "Имя", "", "text" ],
                [ "", { selected: -1, data: listData, value: listValue }, "select" ],
            ],
            ok: "Добавить",
            cancel: "Отмена"
        }
        this.modal.open(Data, (save) => {
            if(save)
            {
                let name = Data.data[0][1];
                let treeId = Data.data[1][1].selected;
                if(name == "") return "Введите имя!";
                if(treeId == -1) return "Выберите шаблон!";
                let bindId = _class.map[treeId].templateId;
                let classId = this.classBind[object.id].classId;
                let type = _class.map[treeId].templateType;
                if(type == "class")
                {
                    classId = _class.map[treeId].templateId;
                    treeId = this.classList[classId].tree.data[0].id;
                    bindId = this.classList[classId].tree.data[0].templateId;
                }
                this.query.protectionPost(493, { param: [ object.id, classId, Data.data[0][1], type, bindId, treeId ] }, (newId) =>
                {
                    openCloseElement[newId] = { 
                        hide: openCloseElement[object.id] ? !openCloseElement[object.id].open : true,
                        open: false 
                    }
                    this.initData();
                })
            }
        });
    }
    removeItem(i)
    {
        let object = this.mainList[i];
        if(!object.edited)
        {
            this.modal.open({ title: "Невозможно удалить элемент!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        this.query.protectionPost(112, { param: [ object.id ] }, () => 
        { 
            this.initData();
        });
    }
    openCollapse(i)
    {
        let openCloseElement = this.openCloseElement[this.object.id];
        let elem = this.mainList[i];
        let begin = elem.level + 1;
        let open = !elem.open;
        elem.open = open; 
        openCloseElement[elem.id] = { hide: elem.hide, open: elem.open };
        for(let _i = i + 1; _i < this.mainList.length; _i++)
            if(this.mainList[_i].level < begin) break;
            else 
            {
                let elem = this.mainList[_i];
                if(!open) 
                {
                    elem.open = false; // если закрываем
                    elem.hide = true; // если закрываем
                }
                else if(elem.level == begin)  elem.hide = false; // если открываем
                openCloseElement[elem.id] = { hide: elem.hide, open: elem.open };
            }
    }
    setCutElement(i)
    {
        this.cutElement = i;
    }
    pasteCutElement(i)
    {
        if(this.cutElement < 0) return;
        let objectFrom = this.mainList[this.cutElement];
        let objectTo = this.mainList[i];
        let from = this.classBind[objectFrom.parent];
        let to = this.classBind[objectTo.id];
        if(from.classId !== to.classId || from.treeId !== to.treeId)
        {
            this.modal.open({ title: "Невозможно вставить элемент!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        this.loaded = false;
        //Применить функцию вырезать 
        this.query.protectionPost(495, { param: [ objectFrom.id, objectTo.id ] }, (errors) => {
            // В ответ могут прийти только ошибки
            this.error = "";
            if(Array.isArray(errors))
            {
                for(let i = 0; i < errors.length; i++)
                    this.error += (errors[i] == "ERROR_IN_ITSELF" ? "Конечная папка является дочерней для копируемой!" : "Неизвестная ошибка!");
                this.loaded = true;
                return;
            }
            this.initData();
        });
        this.cutElement = -1;
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
    demandTable;
    addDemand(i)
    {
        let object = this.mainList[i];
        if(!object.edited)
        {
            this.modal.open({ title: "Невозможно добавить требование!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        if(!this.demandTable) 
        {
            this.modal.open({ title: "Не привязана таблица требований!", data: [], ok: "Ок", cancel: ""});
            return;
        }
        // Запросить заголовки
        this.query.protectionPost(253, { param: [ this.demandTable ] }, (dataHeader) => {

            let fillFields = [];
            let fillFieldsId = [];
            for(let i = 0; i < dataHeader.length; i++)
                if(dataHeader[i] && dataHeader[i].fill) 
                {
                    fillFieldsId.push(dataHeader[i].id);
                    fillFields.push([dataHeader[i].value, "", "text"]);
                }
            if(fillFields.length == 0)
                this.modal.open({ title: "У таблицы требований нету обязательных заголовков!", data: [], ok: "Ок", cancel: ""});
            else this.modal.open({ title: "Заполнить поля", data: fillFields, ok: "Ок", cancel: "Отмена"}, (save) =>
            {
                if(!save) return;
                this.query.protectionPost(257, { param: [ this.demandTable, -1, -1 ] }, (data) => {
                    for(let i = 0; i < fillFieldsId.length; i++)
                    {
                        data[fillFieldsId[i]].value = fillFields[i][1];
                        if(i == 0)
                            this.query.protectionPost(496, { param: [ object.id,  data[fillFieldsId[i]].id ] }, () => {
                                object.demandId = data[fillFieldsId[i]].id;
                            });
                        this.query.protectionPost(252, { param: [ this.demandTable,  JSON.stringify(data[fillFieldsId[i]]) ] }, null);
                    }
                });
            });
            // Добавить строку в таблицу
            // Привязать к записи demand_id
        });
    }
    seacrhCell(demandId)
    {
        this.query.onChange({ type: "openFromTable", value: { name: "cell", id: demandId }});
    }
    seacrhElement(templateId)
    {
        this.query.onChange({ type: "openFromTable", value: { name: "table", id: templateId }});
    }
}
class MyClass
{
    tree: MyTree;
    map:any;
    constructor(list)
    {
        this.tree = new MyTree();
        this.tree.data = list;
        this.map = {};

        for(let i = 0; i < list.length; i++)
            this.map[list[i].id] = list[i];
    }
}