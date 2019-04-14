import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FunctionsService } from '../../lib/functions.service';
import { QueryService } from '../../lib/query.service';
import { isJsObject } from '@angular/core/src/change_detection/change_detection_util';
declare var trace:any;
declare var $:any;
@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.css'],
    providers: [FunctionsService, QueryService]
})
export class ErrorTableComponent implements OnInit 
{
    @ViewChild("mainContainer") mainContainer:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    @ViewChild("mainButtonElement") mainButtonElement:ElementRef;
    @ViewChild("mainSelectElement") mainSelectElement:ElementRef;
    /* @ViewChild("mainStatusElement") mainStatusElement:ElementRef;
    @ViewChild("mainButtonRemoveEvent") mainButtonRemoveEvent:ElementRef; */
    
    @Output() onChange = new EventEmitter<any>();
    header = [];
    firstHeader = {};
    mainData;
    listTables = [];
    firstData = [];
    change = false;
    mapFields = {};
    mainElementIds = 
    {
        mainInputElement: this.sys.getUnicName("m"),
        mainButtonElement: this.sys.getUnicName("m"),
        mainSelectElement: this.sys.getUnicName("m"),
        /* mainStatusElement: this.sys.getUnicName("m"),
        mainButtonRemoveEvent: this.sys.getUnicName("m"), */
    };
    constructor(private sys:FunctionsService, private query:QueryService) { }
    ngOnInit() 
    {
        this.resize();
        this.globalClick = (e) => 
        { 
            this.createContextMenu.visible = false; 
        };
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
        window.addEventListener("click", this.globalClick, false);
        this.mainContainer.nativeElement.onscroll = () => 
        { 
            if(this.inputProperty.visible) this.inputProperty.visible = false;
        }
        for(var key in this.mainElementIds) // выставляем id тегам по которым не должно проходить событие клик
            this[key].nativeElement.setAttribute("id", this.mainElementIds[key]);
    }
    @Input() set head(value)
    {
        if(value)
        {
            this.header = [];
            this.firstHeader = {};
            for(var key in value)
            {
                this.firstHeader[value[key].value] = value[key].i;
                this.header[value[key].i] = value[key];
                this.mapFields[value[key].id] = { name: key, header: true }
            }
        }
    }
    @Input() set data(value)
    {
        if(value)
        {
            this.mainData = value;
            this.firstData = [];
            this.listTables = [];
            for(var i = 0; i < value.length; i++)
            {
                this.listTables[i] = [];
                for(var key in value[i])
                    if(this.firstHeader[key] != undefined)
                    {
                        this.listTables[i][this.firstHeader[key]] = value[i][key];
                        this.mapFields[value[i][key].id] = { i: i, j: this.firstHeader[key] }
                    }
                this.firstData[i] = value[i].__ID__; // id строки в бд
            }
        }
    }
    setScroll(id) // Устанавливает скролл
    {
        let td = document.getElementById(id);
        setTimeout(() => {
            this.mainContainer.nativeElement.scrollTop = td.offsetTop;
            this.mainContainer.nativeElement.scrollLeft = td.scrollLeft;
        }, 100);
    }
    searchCellId = -1; 
    @Input() set searchCell(id) // Выделяет объект красной границей 10 секунд
    {
        if(id) this.searchCellId = id;
    }
    set setCell(value)
    {
        this.listTables[value.i][this.firstHeader[value.key]] = value.value;
    }
    set setObjectCell(value)
    {
        this.listTables[value.i][this.firstHeader[value.key]].listValue = value.listValue;
        this.listTables[value.i][this.firstHeader[value.key]].value = value.value;
    }
    configInput = 
    {
        width: "100px",
        height: "10px",
        top: "0px",
        left: "0px",
        i: -1, 
        j: -1
    }
    inputProperty = 
    {
        id: -1,
        oldValue: "",
        value: "",
        visible: false,
        values: [],
        valueList: "",
        typeValues: "",
        type: "",
        visibleState: false,
        eventId: -1,
        linkId: -1
    }
    rules = 
    {
        copy: false, 
        cut: false, 
        paste: false,
        pasteObject: false
    }
    cacheListValues = {};
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.getPositionInTable(e.target, this.configInput))
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            this.inputProperty.visible = true;
            this.inputProperty.id = this.listTables[i][j].id;
            this.inputProperty.eventId = this.listTables[i][j].eventId;
            this.inputProperty.type = this.listTables[i][j] ? this.listTables[i][j].type : "value";
            this.inputProperty.visibleState = this.inputProperty.type == "value" || this.inputProperty.type == undefined;
            this.inputProperty.linkId = this.listTables[i][j].linkId;
            if(this.listTables[i][j] && this.listTables[i][j].listValue != undefined) 
            {
                let _i = 0;
                if(this.cacheListValues[this.listTables[i][j].linkId])
                {
                    this.inputProperty.values = this.cacheListValues[this.listTables[i][j].linkId];
                    this.inputProperty.typeValues = typeof this.inputProperty.values[0];
                    let value = this.inputProperty.values[this.listTables[i][j].value];
                    if(this.inputProperty.typeValues === "object") 
                        value = this.getValueFromArrayById(this.inputProperty.values, this.listTables[i][j].value);
                    this.inputProperty.oldValue = this.inputProperty.value = value;
                    this.inputProperty.valueList = this.listTables[i][j].value;
                }
                else
                    this.query.protectionPost(304, { param: [this.listTables[i][j].linkId] }, (data) =>
                    {
                        this.inputProperty.typeValues = typeof data[0];
                        this.cacheListValues[this.listTables[i][j].linkId] = data;
                        this.inputProperty.values = data;
                        let value = this.inputProperty.values[this.listTables[i][j].value];
                        if(this.inputProperty.typeValues === "object") 
                            value = this.getValueFromArrayById(this.inputProperty.values, this.listTables[i][j].value);
                        this.inputProperty.oldValue = this.inputProperty.value = value;
                        this.inputProperty.valueList = this.listTables[i][j].value;
                    });
            }
            else 
            {
                this.inputProperty.oldValue = this.inputProperty.value = this.listTables[i][j] ? this.listTables[i][j].value : undefined;
                this.inputProperty.values = [];
            }
            //Проверка на возможность вставки
            this.rules = { copy: true, cut: true, paste: false, pasteObject: false }
            if(this.inputProperty.oldValue == undefined) this.rules.copy = this.rules.cut = false;
            if(localStorage.getItem("copyTable") 
                && this.listTables[i][j].id != localStorage.getItem("copyTable")) //Ячейку нельзя вставить саму в себя
                    this.rules.paste = true;
            if(localStorage.getItem("copyExplorer")) this.rules.pasteObject = true; 
                /* let data = JSON.parse(localStorage.getItem("dragElement"));
                localStorage.removeItem("dragElement"); */
            this.onChange.emit({ type: "operation", rules: this.rules});
            setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
            return true;
        }
        return false;
    }
    getValueFromArrayById(array, id)
    {
        let i = 0;
        for(; i < array.length; i++) if(array[i].id == Number(id)) return array[i].value;
    }
    changeMainSelect()
    {
        if(this.inputProperty.typeValues === "object") 
            this.inputProperty.value = this.getValueFromArrayById(this.inputProperty.values, this.inputProperty.valueList);
        else this.inputProperty.value = this.inputProperty.values[Number(this.inputProperty.valueList)];
    }
    acceptEditField(e) // пропал фокус с выделенной ячейки
    {
        if(e.relatedTarget)
            for(var key in this.mainElementIds) // проверяем id по которым не должно проходить событие клик
                if(e.relatedTarget.getAttribute("id") == this.mainElementIds[key]) return;

        this.inputProperty.visible = false;
        let i = this.configInput.i;
        let j = this.configInput.j;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let type = "value";
            let out:any = {  nameColumn: this.header[j].value, id: this.listTables[i][j].id }; // при обновлении достаточно знать id
            let listValue = null;
            let linkType = "value";
            if(this.inputProperty.values.length > 0)
            {
                let _i = 0;
                listValue = this.inputProperty.value;
                if(typeof this.inputProperty.values[0] === "object") // Проверка на наличие в списке значения
                {
                    linkType = "tlist";
                    for(; _i < this.inputProperty.values.length; _i++) if(this.inputProperty.values[_i].value == listValue) break;
                }
                else 
                    for(; _i < this.inputProperty.values.length; _i++) if(this.inputProperty.values[_i] == listValue) break;
                if(_i != this.inputProperty.values.length) type = "list";
            }
            if(type == "value") out.value = this.inputProperty.value;
            if(type == "list") out.value = { value: this.inputProperty.valueList, linkId:this.listTables[i][j].linkId, type:linkType, listValue: listValue };
            this.onChange.emit({ type: "field", out: out, i: i, nameColumn: this.header[j].value, eventId: this.inputProperty.eventId });
        }
        if(e.relatedTarget)
            if(e.relatedTarget.getAttribute("id") == "tableCutButton" ||
                e.relatedTarget.getAttribute("id") == "tableCopyButton" ||
                    e.relatedTarget.getAttribute("id") == "tablePasteButton") return;
        this.onChange.emit({ type: "operation", rules: { copy: false, cut: false, paste: false }});
    }
    removeRow(i)
    {
        this.onChange.emit({ type: "remove", i: i });
    }
    openToExplorer(data)
    {
        this.onChange.emit({ type: "explorer", data: data });
    }
    openEventToExplorer(eventId)
    {
        this.onChange.emit({ type: "event", eventId: eventId });
    }
    removeEvent()
    {
        this.onChange.emit({ type: "removeEvent", id: this.inputProperty.id, i: this.configInput.i, nameColumn: this.header[this.configInput.j].value });
    }
    getPositionInTable(element, out)
    {
        let i = -1;
        let j = -1;
        let id = element.getAttribute("id");
        if(this.mapFields[id] && !this.mapFields[id].header)
        {
            i = this.mapFields[id].i;
            j = this.mapFields[id].j;
            let mainOffset = $(this.mainContainer.nativeElement).offset();
            /* let scrollTop = this.mainContainer.nativeElement.scrollTop; */
            let offset = $(element).offset();
            out.top = (offset.top - mainOffset.top/*  + scrollTop */) + "px";
            out.left = (offset.left - mainOffset.left) + "px";
            out.width = (element.clientWidth + 1) + "px";
            out.height = (element.clientHeight + 1) + "px";
            out.i = i;
            out.j = j;
            return true;
        }
        return false;
    }
    //////////////////////////////////
    createContextMenu = 
    {
        top: "", 
        left: "", 
        visible: false,
        type: "",
        i: -1
    }
    getContextmenu(e, data, type)
    {
        if(type == "cell") this.editField(e);
        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.createContextMenu.i = data;
        this.createContextMenu.type = type;
        e.preventDefault();
    }
    addRow(prevOrNext)
    {
        let idRow = this.firstData[this.createContextMenu.i + prevOrNext] ? this.firstData[this.createContextMenu.i + prevOrNext] : -1;
        this.onChange.emit({ type: "row", idRow: idRow, idNextRow: idRow == -1 ? this.firstData[this.createContextMenu.i] : -1 });
    }
    pasteField()
    {
        this.onChange.emit({ type: "paste" });
    }
    pasteObject()
    {
        this.onChange.emit({ type: "pasteObject" });
    }
    copyOrCut(type)
    {
        this.onChange.emit({ type: "copyOrCut", copyOrCut: type });
    }
    setState(value:number)
    {
        let i = this.configInput.i;
        let j = this.configInput.j;
        this.onChange.emit({ type: "state", id: this.inputProperty.id, i: i, nameColumn: this.header[j].value, state: value });
    }
    //////////////////////////////////
    height = "";
    functionResize;
    globalClick;
    resize()
    {
        this.height = document.documentElement.clientHeight - 127 + "px";
    }
    ngOnDestroy() 
    {
        window.removeEventListener("click", this.globalClick, false);
        window.removeEventListener("resize", this.functionResize, false);
    }
    dragoverHandler(e) { e.preventDefault(); } // для того чтобы подсвечивалось cursor
    downEnter(e)
    {
        if(e.keyCode == 13 && this.inputProperty.visible) this.inputProperty.visible = false;
    }
}
