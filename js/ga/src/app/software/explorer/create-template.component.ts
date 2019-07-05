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
    libraryId = -1;
    mainList = [];
    template:any = [];
    typeByLevel = [];
    name = "";
    parent;
    folder;
    myTree:MyTree = new MyTree();
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
        if(this.folder !== null) this.settings.id = this.folder.bindId;
        else
            if(localStorage.getItem("copyExplorer"))
                this.settings = JSON.parse(localStorage.getItem("copyExplorer"));
        this.query.protectionPost(491, { param: [ this.settings.id ] }, (data) =>
        {
            this.loaded = true;
            /* trace(this.parent) */
            this.name = data.name;
            /* trace(data) */
            this.template = JSON.parse(data.structure);
            this.libraryId = data.libraryId;
            /* trace(this.template) */
            /* this.mainList = []; */
            this.myTree.push(-1, { name: "root" });
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
                    if(this.template.typeList[j].children == this.template.typeList[j].name) break;
                if(j == this.template.typeList.length) break;
            }
            this.typeByLevel = [this.template.typeList[i]];
            let k = 0;
            while(k < this.template.typeList.length - 1)
                this.typeByLevel.push(this.searchFromArrayByName(this.template.typeList, this.typeByLevel[k++].children));
            this.typeByLevel[this.typeByLevel.length - 1].last = true;
            trace(this.typeByLevel)
            this.mainList = this.myTree.straighten();

            if(this.folder !== null)
            {
                this.query.protectionPost(494, { param: [ this.folder.id ] }, (data) =>
                {
                    trace(data)
                });
            }
        });
    }
    searchFromArrayByName(array, name)
    {
        let i = 0
        for(; i < array.length; i++) // Поиск первого
            if(array[i].name == name) break;
        return array[i];
    }
    selectParent(i)
    {
        this.createSetting.parent = i;
        this.createSetting.table = 'none';
        this.tableList = [];
        if(!this.typeByLevel[this.mainList[i].level]) return;
        let type = this.typeByLevel[this.mainList[i].level].name;

        this.createSetting.last = this.typeByLevel[this.mainList[i].level].last === true;
        this.checkLastChildren(i);
        for(let j = 0; j < this.library.type.length; j++)
            if(this.library.type[j].name == type)
                this.tableList.push(this.library.name[j]);
    }
    inputName = "";
    createSetting = 
    {
        parent: -1,
        table: 'none',
        last: false,
        block: false
    }
    tableList = [];
    appendNode()
    {
        let i = this.createSetting.parent;
        let j = 0;
        if(this.createSetting.table == 'none' || this.checkLastChildren(i)) return;
        for(; j < this.tableList.length; j++)
            if(this.tableList[j].id == Number(this.createSetting.table)) break;
        this.myTree.push(this.mainList[i].id, { name: this.tableList[j].name, fieldId: this.tableList[j].id, templateId: this.typeByLevel[this.mainList[i].level].templateId, last: this.createSetting.last });
        this.mainList = this.myTree.straighten();
    }
    checkLastChildren(i) // В последнем элементе дерева не может быть больше 1 элемента
    {
        /* trace(this.createSetting.block)
        trace(this.createSetting.last)
        trace(this.myTree.getCountChildren(this.mainList[i].id)) */
        if(this.createSetting.last)
        {
            if(this.myTree.getCountChildren(this.mainList[i].id) > 0)
            {
                this.createSetting.block = true;
                return true;
            }
            else this.createSetting.block = false;
        }
        else this.createSetting.block = false;
        return false;
    }
    removeItem(i)
    {
        this.myTree.remove(this.mainList[i].id);
        this.mainList = this.myTree.straighten();
        this.clearSelect();
    }
    clearSelect()
    {
        this.createSetting.parent = -1;
        this.createSetting.table = 'none';
    }
    Cancel(e?)
    {
        this.onChange.emit(e);
    }
    loaded = true;
    Create()
    {
        this.loaded = false;
        if(this.inputName != "") this.mainList[0].name = this.inputName;
        this.query.protectionPost(493, { param: [ JSON.stringify(this.mainList), JSON.stringify(this.template.typeList), this.libraryId, this.parent, this.settings.id ] }, (data) =>
        {
            this.loaded = true;
            this.Cancel("update");
        });
    }
    
}
class MyTree
{
    data = [];
    constructor()
    {
    }
    push(parent, data)
    {
        this.data.push({ id: this.getId(), parent: parent, ...data });
    }
    remove(id)
    {
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].id == id) 
            {
                this.data.splice(i, 1);
                break;
            }
    }
    getRecursionRemove(out, parent, level)
    {
        out.push({ ...parent, level: level });
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id) this.getRecursion(out, this.data[i], level + 1);
    }
    getCountChildren(parent)
    {
        let l = 0;
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].parent == parent) l++;
        return l;
    }
    straighten()
    {
        let out = [];
        this.getRecursion(out, this.data[0], 0); // Первый элемент всегда корневой, поэтому не надо искать минимальный id
        return out;
    }
    getRecursion(out, parent, level)
    {
        out.push({ ...parent, level: level });
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id) this.getRecursion(out, this.data[i], level + 1);
    }
    getId()
    {
        let max = 0;
        for(let i = 0; i < this.data.length; i++)
            if(this.data[i].id > max) max = this.data[i].id;
        return max + 1;
    }
}