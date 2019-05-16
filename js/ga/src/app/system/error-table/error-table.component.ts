import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FunctionsService } from '../../lib/functions.service';
import { QueryService } from '../../lib/query.service';
import { isJsObject } from '@angular/core/src/change_detection/change_detection_util';
import { ModalMovedWindowComponent } from '../modal-moved-window/modal-moved-window.component';
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
    @ViewChild("modalMovedWindow") modalMovedWindow:ModalMovedWindowComponent;
    
    /* @ViewChild("mainStatusElement") mainStatusElement:ElementRef;
    @ViewChild("mainButtonRemoveEvent") mainButtonRemoveEvent:ElementRef; */
    @Input() set head(value)
    {
        if(value)
        {
            this.header = [];
            this.firstHeader = {};
            this.filter.fields = [];
            this.filter.state = [];
            for(var key in value)
            {
                this.firstHeader[value[key].value] = value[key].i;
                this.header[value[key].i] = value[key];
                this.filter.fields[value[key].i] = { value: "" };
                this.filter.state[value[key].i] = { value: "" };
                this.mapFields[value[key].value] = { name: key, header: true };
            }
        }
    }
    @Input() set data(value)
    {
        if(value)
        {
            this.mainData = value;
            this.updateData();
        }
    }
    @Input() set searchCell(id) // Выделяет объект красной границей 10 секунд
    {
        if(id) this.searchCellId = id;
    }
    @Output() onChange = new EventEmitter<any>();
    header = [];
    firstHeader = {};
    filter = 
    {
        fields: [],
        state: [],
        count: 0,
        countHide: 0
    }
    mapHideRows = {}; // По этому объекту скрываются строки не подходящие по фильтру
    mainData;
    listTables = [];
    firstData = [];
    mapFields = {};
    searchCellId = -1; 
    configInput = {
        width: "100px",
        height: "10px",
        top: "0px",
        left: "0px",
        i: -1, 
        j: -1
    }
    inputProperty = {
        set id(value) {
            this._id = value;
            this._colorId = value;
            this.self.onChange.emit({ type: "bottomControlPanel", id: value });
        },
        get id() {
            return this._id;
        },
        _id: -1, // Требуется для запросов
        _colorId: -1, // Требуется для подсвечивания ячейки
        oldValue: "",
        value: "",
        count: 0,
        visible: false,
        values: [],
        valueList: "",
        typeValues: "",
        type: "",
        eventId: -1,
        linkId: -1,
        close: function() {
            this.visible = false;
            this._colorId = -1;
            this.self.onChange.emit({ type: "bottomControlPanel", id: -1 });
        },
        clearId: function() {
            this._colorId = -1;
            this.self.onChange.emit({ type: "bottomControlPanel", id: -1 });
        },
        self: this
    }
    right = { change: false, copy: false, cut: false};
    rules = {
        change: false, // Разрешено изменять
        copy: false, // Разрешено копирование
        cut: false,  // Разрешено вырезать
        paste: false, // В табличном буфере что-то есть
        object: false, // В буфере объект
        event: false, // В буфере есть событие
        type: false // В буфере находится tlist пригодный для типа
    }
    cacheListValues = {};
    constructor(private sys:FunctionsService, private query:QueryService) { }
    ngOnInit() 
    {
        this.globalClick = (e) => 
        { 
            this.createContextMenu.visible = false; 
            if(e.target.getAttribute("name") == "clickArea")
                this.inputProperty.close();
        };
        window.addEventListener("click", this.globalClick, false);
        setTimeout(() => {
            this.onChange.emit({ type: "getRight" });
        }, 20);
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
    updateData()
    {
        this.firstData = [];
        this.listTables = [];
        this.mapHideRows = {};
        let rowHide;
        this.filter.count = this.mainData.length;
        this.filter.countHide = 0;
        for(var i = 0; i < this.mainData.length; i++)
        {
            this.listTables[i] = [];
            rowHide = false;
            for(var key in this.mainData[i])
            {
                if(this.firstHeader[key] != undefined)
                {
                    let cell = this.mainData[i][key];
                    this.listTables[i][this.firstHeader[key]] = cell;
                    this.mapFields[cell.id] = { i: i, j: this.firstHeader[key] };
                    if(cell)
                    {
                        if(this.filter.fields[this.firstHeader[key]].value != "")
                        {
                            let str = (cell.listValue || cell.value).toLowerCase();
                            let substr = this.filter.fields[this.firstHeader[key]].value.toLowerCase();
                            if(str.indexOf(substr) !== -1) rowHide = false; // содержит
                            else rowHide = true; // не содержит
                        }
                        if(this.filter.state[this.firstHeader[key]].value != "") 
                        {
                            if(cell.state >= Number(this.filter.state[this.firstHeader[key]].value))
                                rowHide = true;
                        }
                    }
                }
            }
            this.filter.countHide += rowHide ? 1 : 0;
            this.mapHideRows[i] = rowHide;
            this.firstData[i] = this.mainData[i].__ID__; // id строки в бд
        }
        this.onChange.emit({ type: "bottomControlPanelFilter", filter: this.filter });
    }
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.right.change)
            if(this.getPositionInTable(e.target, this.configInput))
            {
                let i = this.configInput.i;
                let j = this.configInput.j;
                this.inputProperty.visible = true;
                this.inputProperty.count = 0;
                this.inputProperty.id = this.listTables[i][j].id;
                this.inputProperty.eventId = this.listTables[i][j].eventId;
                this.inputProperty.type = "value";
                if(this.listTables[i][j] && this.listTables[i][j].type) this.inputProperty.type = this.listTables[i][j].type;
                if(this.header[j].dataType == "DATETIME") 
                    this.inputProperty.type = "datetime";
                this.inputProperty.linkId = this.listTables[i][j].linkId;
                if(this.listTables[i][j] && this.listTables[i][j].listValue !== undefined) 
                {
                    let _i = 0;
                    /* if(this.cacheListValues[this.listTables[i][j].linkId])
                    {
                        this.inputProperty.values = this.cacheListValues[this.listTables[i][j].linkId];
                        this.inputProperty.typeValues = typeof this.inputProperty.values[0];
                        let value = this.inputProperty.values[this.listTables[i][j].value];
                        if(this.inputProperty.typeValues === "object") 
                            value = this.getValueFromArrayById(this.inputProperty.values, this.listTables[i][j].value);
                        this.inputProperty.oldValue = this.inputProperty.value = value;
                        this.inputProperty.valueList = this.listTables[i][j].value;
                    }
                    else */
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
                if(this.inputProperty.type == "datetime") 
                {
                    this.openDatetimeModal();
                    this.inputProperty.visible = false;
                }
                setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
                return true;
            }
        return false;
    }
    onChangeFilter(i, value)
    {
        this.filter.fields[i].value = value;
        this.updateData();
    }
    onChangeFilterState(i, value)
    {
        this.filter.state[i].value = value;
        this.updateData();
    }
    clearFilters()
    {
        for(let i = 0; i < this.filter.fields.length; i++)
            this.filter.fields[i].value = this.filter.state[i].value = "";
        this.updateData();
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
        this.acceptEditField();
    }
    acceptEditField() // пропал фокус с выделенной ячейки
    {
        this.inputProperty.close();
        let i = this.configInput.i;
        let j = this.configInput.j;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let type = "value";
            let out:any = { id: this.listTables[i][j].id }; // при обновлении достаточно знать id
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
    }
    removeRow(i)
    {
        this.onChange.emit({ type: "remove", i: i });
    }
    openToExplorer(data)
    {
        this.onChange.emit({ type: "explorer", data: data });
    }
    openSoftware(type, id) // Открывает без отображения в проводнике
    {
        this.onChange.emit({ type: "openSoftware", data: { id: id, type: type }});
    }
    openEventToExplorer(eventId)
    {
        this.onChange.emit({ type: "event", eventId: eventId });
    }
    openDatetimeModal()
    {
        this.modalMovedWindow.open = true;
        this.modalMovedWindow.inputValue = this.inputProperty.value;
        this.modalMovedWindow.change = (datetime) =>
        {
            this.inputProperty.value = datetime;
            this.acceptEditField();
        };
    }
    removeEvent(head)
    {
        this.onChange.emit({ 
            type: "removeEvent", 
            id: this.inputProperty.id, 
            i: this.configInput.i,
            nameColumn: head ? -1 : this.header[this.configInput.j].value,
            head: head
        });
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
            let offset = $(element).offset();
            out.top = (offset.top - mainOffset.top) + "px";
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
        i: -1,
        transform: ""
    }
    getContextmenu(e, data, type)
    {
        //Проверка на возможность вставки
        for(let key in this.rules) this.rules[key] = false;
        this.rules.change = this.right.change;
        this.rules.copy = this.right.copy;
        this.rules.cut = this.right.cut;
        let copyExplorer = localStorage.getItem("copyExplorer");
        if(copyExplorer) 
        {
            let copy = JSON.parse(copyExplorer);
            this.rules.object = true;
            this.rules.event = copy.objectType == "event";
            this.rules.type = copy.objectType == "tlist";
        }
        if(localStorage.getItem("copyTable")) this.rules.paste = true;
        switch(type) // Здесь должны заполнится правила
        {
            case "cell":
                if(this.getPositionInTable(e.target, this.configInput))
                {
                    let i = this.configInput.i;
                    let j = this.configInput.j;
                    this.inputProperty.id = this.listTables[i][j].id;
                    this.inputProperty.eventId = this.listTables[i][j].eventId;
                    this.inputProperty.type = "value";
                    if(this.listTables[i][j] && this.listTables[i][j].type) this.inputProperty.type = this.listTables[i][j].type;
                    if(this.header[j].dataType == "DATETIME") 
                    {
                        this.inputProperty.type = "datetime";
                        this.inputProperty.value = this.listTables[i][j].value;
                    }
                    this.inputProperty.linkId = this.listTables[i][j].linkId;
                    if(this.listTables[i][j].id == localStorage.getItem("copyTable")) //Ячейку нельзя вставить саму в себя
                        this.rules.paste = false;
                }
                break;
            case "head":
                this.inputProperty.id = this.header[data].value;
                this.inputProperty.eventId = this.header[data].eventId;
                break;
            case "row":
                break;
        }
        this.rules.paste = this.rules.paste && this.rules.change;
        this.rules.object = this.rules.object && this.rules.change; // Чтобы в html не делать несколько проверок

        let height = this.mainContainer.nativeElement.clientHeight;
        if(e.clientY > height / 2) this.createContextMenu.transform = "translate(0, -100%)";
        else this.createContextMenu.transform = null;

        this.createContextMenu.left = e.clientX + "px";
        this.createContextMenu.top = e.clientY + "px";
        this.createContextMenu.visible = true;
        this.createContextMenu.i = data;
        this.createContextMenu.type = type;
        e.preventDefault();
    }
    addRow(prevOrNext)
    {
        let idRow = this.firstData[this.createContextMenu.i] ? this.firstData[this.createContextMenu.i] : -1;
        this.onChange.emit({ type: "row", idRow: idRow, prevOrNext: prevOrNext });
    }
    pasteField(type)
    {
        this.onChange.emit({ type: "paste", typePaste: type });
    }
    pasteObject(setType, primitive)
    {
        this.onChange.emit({ type: "pasteObject", setType: setType, primitive: primitive });
    }
    clearField()
    {
        let i = this.configInput.i;
        let j = this.configInput.j;
        this.onChange.emit({ type: "field", out: { id: this.inputProperty.id, value: "" }, i: i, nameColumn: this.header[j].value, eventId: this.inputProperty.eventId });
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
    globalClick;
    ngOnDestroy() 
    {
        window.removeEventListener("click", this.globalClick, false);
    }
    downEnter(e)
    {
        if(e.keyCode == 13 && this.inputProperty.visible) this.acceptEditField();
    }
}
