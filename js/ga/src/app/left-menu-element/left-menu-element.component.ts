import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from "../lib/query.service";

declare var trace:any;

@Component({
    selector: 'app-left-menu-element',
    templateUrl: './left-menu-element.component.html',
    styleUrls: ['./left-menu-element.component.css'],
    providers: [ QueryService ]
})
export class LeftMenuElementComponent implements OnInit 
{
    @ViewChild("inputSearch") public inputSearch:ElementRef;
    @Input() set config(config)
    {
        if(config)
        {
            if(config.name) this._config.name = config.name;
            if(config.id) this._config.id = config.id;
            if(config.buttons) this._config.buttons = config.buttons;
            if(config.filter) this._config.filter = config.filter;
        }
    }
    @Input() set data(data)
    {
        for(var i = 0; i < data.length; i++)
            this.straighten(this.outData, data[i], 0, -1);
        if(this.outData.length == 0)
            this.hide = true;
    }
    @Input() set openObject(func)
    {
        if(func)
            this._openObject = func;
    }
    _openObject = null;
    _config = 
    {
        id: null,
        name: "",
        buttons: ["search", "open", "hide"],
        filter: []
    };
    outData = [];
    hide = false;
    searchVisible = false;
    oldSearchVisible = false;
    search = '';

    constructor(private query: QueryService) { }
    ngOnInit() 
    { 
        /* var self = this;
        window.addEventListener("click", (e:any) =>
        {
            self.searchVisible = false;

            self.oldSearchVisible = self.searchVisible;
        }); */
    }
    openElement(data)
    {
        switch(data.objectType)
        {
            case "folder":
                this._openObject("explorer", { id: data.id });
                break;
            case "table":
                this._openObject("table", { id: data.id });
                break;
            case "value":
                this.query.protectionPost(111, { param: [ data.id ]}, (idParent) =>
                {
                    this._openObject("explorer", { id: idParent[0][0], element: data.id });
                });
                trace(data)
                break;
        }
    }
    straighten(out, data, level, parent) // из объекта получаем одномерный массив со всеми полями дерева
    {
        let childrens = data.childrens;
        let j = out.length;
        out[j] = {id: data.id, name: data.name, objectType: data.objectType, type: data.type, level: level, hide: !(level <= 0), open: false, parent: parent, searchHide: false};
        level++;
        if(childrens.length == 0) out[j].end = true;
        else
            for(j = 0; j < childrens.length; j++)
                this.straighten(out, childrens[j], level, data.id);
    }
    openCollapse(i, level) // открываем или закрываем выпадающий список
    {
        var begin = level + 1;
        var open = !this.outData[i].open;
        this.outData[i].open = open; 
        for(var _i = i + 1; _i < this.outData.length; _i++)
            if(this.outData[_i].level < begin) break;
            else 
                if(!open) this.outData[_i].hide = !open; // если закрываем
                else this.outData[_i].hide = !this.outData[this.getParentI(this.outData[_i].parent)].open; // если открываем
    }
    getParentI(id)
    {
        for(var _i = 0; _i < this.outData.length; _i++)
            if(this.outData[_i].id == id) return _i;
    }
    hideAllMenu()
    {
        this.hide = !this.hide;
    }
    visibleSearch()
    {
        this.searchVisible = !this.searchVisible;
        if(this.searchVisible) setTimeout(() => { this.inputSearch.nativeElement.focus(); }, 20);
    }
    OnChangeSearch()
    {
        var search = this.search.toLowerCase();
        for(var i = 0; i < this.outData.length; i++)
            if(this.outData[i].id != -1)
            {
                if(this.outData[i].objectType != "folder" && this.outData[i].name.toLowerCase().indexOf(search) != -1)
                    this.outData[i].searchHide = false;
                else this.outData[i].searchHide = true;
            }
    }
}
