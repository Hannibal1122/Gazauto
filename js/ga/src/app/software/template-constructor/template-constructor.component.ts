import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { MyTree } from './my-tree.service';

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
    rules = [];
    readonly = true;
    myTree;
    typeObject = "apart";
    constructor(private query:QueryService) { }
    ngOnInit()
    {
        this.id = this.inputs.id;
        this.loadData();
    }
    loadData()
    {
        this.myTree = new MyTree();
        this.myTree.push(-1, { name: "root" });
        this.query.protectionPost(491, { param: [ this.id ] }, (data) =>
        {
            this.query.onChange({ type: "updateClassName", id: this.id, name: data.name });
            this.readonly = data.readonly;
            if(data.structure != "")
            {
                this.myTree.data = JSON.parse(data.structure);
            }
            this.rules = this.myTree.straighten();
        });
    }
    appendNode(i)
    {
        this.myTree.push(this.rules[i].id, { templateId: -1,/*  last: false, */ type: this.typeObject });
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
    }/* 
    onChangeLast(i)
    {
        this.myTree.getElement(this.rules[i].id).last = this.rules[i].last;
    } */
    saveData()
    {
        let save = JSON.stringify(this.myTree.data);
        this.query.protectionPost(492, { param: [ this.id, save ] }, (data) =>
        {
        });
    }
}