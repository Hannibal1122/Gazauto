import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
declare var trace:any;

@Component({
    selector: 'app-left-menu-element',
    templateUrl: './left-menu-element.component.html',
    styleUrls: ['./left-menu-element.component.css']
})
export class LeftMenuElementComponent implements OnInit 
{
    @ViewChild("inputSearch") public inputSearch:ElementRef;
    @Input() set config(config)
    {
        if(config)
        {
            if(config.name) this._config.name = config.name;
            if(config.buttons) this._config.buttons = config.buttons;
            if(config.filter) this._config.filter = config.filter;
        }
    }
    @Input() set data(data)
    {
        for(var i = 0; i < data.length; i++)
            this.straighten(this.outData, data[i], 0, -1);
    }
    _config = 
    {
        name: "",
        buttons: ["search", "open", "hide"],
        filter: []
    };
    outData = [];
    hide = false;
    searchVisible = false;
    oldSearchVisible = false;
    search;

    constructor() { }
    ngOnInit() 
    { 
        /* var self = this;
        window.addEventListener("click", (e:any) =>
        {
            self.searchVisible = false;

            self.oldSearchVisible = self.searchVisible;
        }); */
    }
    straighten(out, data, level, parent) // из объекта получаем одномерный массив со всеми полями дерева
    {
        let childrens = data.childrens;
        let j = out.length;
        //out[j] = {id: data.id, name: data.name, objectType: data.objectType, type: data.type, level: level, hide: !(level <= 1), open: level == 0, parent: parent, searchHide: false};
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
        if(this.searchVisible) setTimeout(() => { this.inputSearch.nativeElement.focus(); }, 100);
    }
    OnChangeSearch()
    {
        /* var search = this.search.toLowerCase();
        for(var i = 0; i < this.outData.length; i++)
            if(this.outData[i].id != -1)
            {
                if(this.outData[i].name.toLowerCase().indexOf(search) != -1)
                    this.outData[i].searchHide = false;
                else this.outData[i].searchHide = true;
            }
        var mainSearch = {0: {}};
        for(var i = 0; i < this.outData.length; i++)
        {
            if(this.outData[i].parent != -1)
            {
                if(mainSearch[this.outData[i].parent] == null) mainSearch[this.outData[i].parent] = {};
                mainSearch[this.outData[i].parent][i] = this.outData[i].searchHide;
                this.getUpLevelSearch(mainSearch, this.outData[this.getParentI(this.outData[i].parent)].parent, this.outData[i].parent);
            }
        }
        for(var key in mainSearch)
            if(this.outData[key] != undefined)
            {
                var _value = true;
                for(var _key in mainSearch[key]) _value = _value && mainSearch[key][_key];
                this.outData[key].searchHide = _value;
            } */
    }
    getUpLevelSearch(mainSearch, parent, i)
    {
        /* if(parent != -1)
        {
            var _value = true;
            for(var key in mainSearch[i]) _value = _value && mainSearch[i][key];
            mainSearch[parent][i] = _value;
            this.getUpLevelSearch(mainSearch, this.outData[this.getParentI(parent)].parent, parent);
        } */
    }
}
