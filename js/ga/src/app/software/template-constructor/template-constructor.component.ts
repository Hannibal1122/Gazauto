import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { MyTree } from './my-tree.service';

declare var trace:any;
@Component({
    selector: 'app-template-constructor',
    templateUrl: './template-constructor.component.html',
    styleUrls: ['./template-constructor.component.css', '../explorer/head-path.component.css'],
    providers: [ QueryService ]
})
export class TemplateConstructorComponent implements OnInit 
{
    @ViewChild("modal") modal;

    allPath = [];
    inputs:any = {};
    id = -1;
    rules = [];
    readonly = true;
    myTree;
    error = "";
    cutElement = -1;
    /* typeObject = "apart"; */
    constructor(private query:QueryService) { }
    ngOnInit()
    {
        this.id = this.inputs.id;
        this.loadData();
    }
    loadData()
    {
        this.myTree = new MyTree();
        this.myTree.push(0, { name: "root" });
        this.query.protectionPost(491, { param: [ this.id ] }, (data) =>
        {
            /* this.query.onChange({ type: "updateClassName", id: this.id, name: data.name }); */
            this.readonly = data.readonly;
            if(data.structure != "")
            {
                this.myTree.data = JSON.parse(data.structure);
            }
            this.rules = this.myTree.straighten();
        });

        //Загрузка пути
        this.query.protectionPost(110, { param: [ this.id ] }, (data) => 
        { 
            this.allPath = data.path;
            this.allPath.push({id: 0, name: "Root"});
            this.allPath.reverse();
        });
    }
    appendNode(i)
    {
        this.myTree.push(this.rules[i].id, { templateId: undefined, open: true,  hide: false });
        this.rules = this.myTree.straighten();
    }
    removeNode(i)
    {
        this.myTree.remove(this.rules[i].id);
        this.rules = this.myTree.straighten();
    }
    setFromCopy(i)
    {
        if(localStorage.getItem("copyExplorer"))
        {
            let id = JSON.parse(localStorage.getItem("copyExplorer")).id;
            this.rules[i].templateId = id;
            this.onChangeTemplate(i);
        }
    }
    onChangeTemplate(i)
    {
        this.myTree.getElement(this.rules[i].id).templateId = this.rules[i].templateId;
    }
    onChangeName(i)
    {
        this.myTree.getElement(this.rules[i].id).name = this.rules[i].name;
    }
    openCollapse(i)
    {
        let begin = this.rules[i].level + 1;
        let open = !this.rules[i].open;
        let elem = this.myTree.getElement(this.rules[i].id);
        this.rules[i].open = open; 
        elem.open = open;
        for(let _i = i + 1; _i < this.rules.length; _i++)
            if(this.rules[_i].level < begin) break;
            else 
            {
                elem = this.myTree.getElement(this.rules[_i].id);
                if(!open) 
                {
                    this.rules[_i].open = false; // если закрываем
                    this.rules[_i].hide = true; // если закрываем
                    elem.open = false;
                    elem.hide = true;
                }
                else if(this.rules[_i].level == begin) 
                {
                    this.rules[_i].hide = false; // если открываем
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
        let cutElement = this.myTree.getElement(this.rules[this.cutElement].id);
        let out = [];
        this.error = "";
        this.myTree.getRecursionRemove(out, cutElement);
        for(let j = 0; j < out.length; j++)
            if(out[j] == this.rules[i].id) this.error = "Конечная папка является дочерней для копируемой!";
        if(this.error != "") return;
        cutElement.parent = this.rules[i].id;
        if(!this.rules[i].open)
        {
            let out = [];
            this.myTree.getRecursionRemove(out, this.rules[i]);
            for(let j = 1; j < out.length; j++)
            {
                let elem = this.myTree.getElement(out[j]);
                elem.open = false;
                elem.hide = true;
            }
        }
        this.rules = this.myTree.straighten();
        this.cutElement = -1;
    }
    saveData()
    {
        let error = false;
        this.error = "";
        for(let i = 0; i < this.myTree.data.length; i++)
        if(this.myTree.data[i].templateId === undefined) error = true;
        if(error)
        {
            this.error = "Не выставлен шаблон!";
            return;
        }
        let save = JSON.stringify(this.myTree.data);
        this.query.protectionPost(492, { param: [ this.id, save ] }, (data) =>
        {
        });
    }
    seacrhElement(templateId)
    {
        this.query.onChange({ type: "openFromTable", value: { name: "table", id: templateId }});
    }
    openSoftware(type, id) // Открыть объект
    {
        this.query.onChange({ type: "openFromTable", value: { type: "open", name: type, id: id }});
    }
}