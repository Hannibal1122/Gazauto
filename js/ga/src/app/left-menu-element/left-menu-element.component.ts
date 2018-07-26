import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { QueryService } from "../lib/query.service";

declare var trace:any;
declare var $:any;

@Component({
    selector: 'app-left-menu-element',
    templateUrl: './left-menu-element.component.html',
    styleUrls: ['./left-menu-element.component.css'],
    providers: [ QueryService ]
})
export class LeftMenuElementComponent implements OnInit 
{
    @ViewChild("inputSearch") public inputSearch:ElementRef;
    @Output() onChange = new EventEmitter<any>();
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
        for(i = 0; i < this.outData.length; i++)
        {
            if(this.outData[i].objectType == "file")
            {
                let name = this.outData[i].name;
                let type = name.substr(name.lastIndexOf(".") + 1);
                switch(type)
                {
                    case 'gif':
                    case 'jpeg':
                    case 'png':
                    case 'jpg':
                        this.outData[i].fileType = "img";
                        break;
                    case 'xls':
                    case 'xlsx':
                        this.outData[i].fileType = "xls";
                        break;
                    case 'doc':
                    case 'docx':
                        this.outData[i].fileType = "doc";
                        break;
                }
            }
        }
        if(this.outData.length == 0) this.hide = true;
    }
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
        /* trace(data) */
        switch(data.objectType)
        {
            case "folder":
                this.onChange.emit({ type: "open", value: { name: "explorer", id: data.id }});
                break;
            case "table":
                this.onChange.emit({ type: "open", value: { name: "table", id: data.id }});
                break;
            case "value":
                this.query.protectionPost(111, { param: [ "folder", data.id ]}, // folder потому что id тут из структуры  
                (idParent) => 
                {
                    this.onChange.emit({ type: "open", value: { name: "explorer", id: idParent[0][0], element: data.id }});
                });
                break;
            case "file":
                this.query.protectionPost(111, { param: [ data.objectType, data.id ]}, (idParent) =>
                {
                    this.onChange.emit({ type: "open", value: { name: "explorer", id: idParent[0][0], searchObjectId: data.id }});
                });
                break;
            case "user":
            case "role":
                this.query.protectionPost(111, { param: [ data.objectType, data.id ]}, (idParent) =>
                {
                    this.onChange.emit({ type: "open", value: { name: "explorer", id: idParent[0][0], element: data.id }});
                });
                break;
            case "event":
                this.onChange.emit({ type: "open", value: { name: "event", id: data.id }});
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
        this.onChange.emit({ type: "height" });
        /* if(this._changeHeightForLeftMenu) this._changeHeightForLeftMenu(); */
    }
    getParentI(id)
    {
        for(var _i = 0; _i < this.outData.length; _i++)
            if(this.outData[_i].id == id) return _i;
    }
    hideAllMenu()
    {
        this.hide = !this.hide;
        this.onChange.emit({ type: "height" });
    }
    visibleSearch()
    {
        this.searchVisible = !this.searchVisible;
        if(this.searchVisible) setTimeout(() => { this.inputSearch.nativeElement.focus(); }, 20);
        else this.search = "";
        this.onChange.emit({ type: "height" });
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
        this.onChange.emit({ type: "height" });
    }
    dragEvents(data, e)
    {
        /* e.target.style.cursor = "move" */
        /* var img = document.createElement("img");
        img.src = 'http://cdn.habtium.com/furni/items/big/1.gif';
        e.dataTransfer.setDragImage(img, 10, 10); */
        
        localStorage.setItem("dragElement", JSON.stringify(data));
        /* trace("dragStart")
        trace(e)
        trace(data) */
    }
}
