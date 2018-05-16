import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FunctionsService } from '../../lib/functions.service';
import { QueryService } from '../../lib/query.service';
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
    @ViewChild("mainEditElement") mainEditElement:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    @ViewChild("mainButtonElement") mainButtonElement:ElementRef;
    @ViewChild("mainSelectElement") mainSelectElement:ElementRef;
    
    @Output() onChange = new EventEmitter<any>();
    header = [];
    firstHeader = {};
    mainData;
    listTables = [];
    firstData = [];
    change = false;
    mainElementIds = 
    {
        mainEditElement: this.sys.getUnicName("m"),
        mainInputElement: this.sys.getUnicName("m"),
        mainButtonElement: this.sys.getUnicName("m"),
        mainSelectElement: this.sys.getUnicName("m"),
    };
    constructor(private sys:FunctionsService, private query:QueryService) { }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);

        this.mainEditElement.nativeElement.setAttribute("id", this.mainElementIds.mainEditElement);
        this.mainInputElement.nativeElement.setAttribute("id", this.mainElementIds.mainInputElement);
        this.mainButtonElement.nativeElement.setAttribute("id", this.mainElementIds.mainButtonElement);
        this.mainSelectElement.nativeElement.setAttribute("id", this.mainElementIds.mainSelectElement);
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
            }
        }
    }
    @Input() set data(value)
    {
        if(value)
        {
            /* trace(value) */
            this.mainData = value;
            this.firstData = [];
            this.listTables = [];
            for(var i = 0; i < value.length; i++)
            {
                this.listTables[i] = [];
                for(var key in value[i])
                    if(this.firstHeader[key] != undefined)
                        this.listTables[i][this.firstHeader[key]] = value[i][key];
                this.firstData[i] = value[i].__ID__; // id строки в бд
            }
        }
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
        oldValue: "",
        value: "",
        visible: false,
        values: [],
        type: ""
    }
    cacheListValues = {};
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.getPositionInTable(e.target, this.configInput))
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            this.inputProperty.visible = true;
            this.inputProperty.type = this.listTables[i][j] ? this.listTables[i][j].type : "value";
            if(this.listTables[i][j] && this.listTables[i][j].listValue) 
            {
                let _i = 0;
                if(this.cacheListValues[this.listTables[i][j].linkId])
                {
                    this.inputProperty.values = this.cacheListValues[this.listTables[i][j].linkId];
                    this.inputProperty.oldValue = this.inputProperty.value = this.inputProperty.values[Number(this.listTables[i][j].value)];
                }
                else
                    this.query.protectionPost(304, { param: [this.listTables[i][j].linkId] }, (data) =>
                    {
                        this.cacheListValues[this.listTables[i][j].linkId] = data;
                        this.inputProperty.values = data;
                        this.inputProperty.oldValue = this.inputProperty.value = this.inputProperty.values[Number(this.listTables[i][j].value)];
                    });
            }
            else 
            {
                this.inputProperty.oldValue = this.inputProperty.value = this.listTables[i][j] ? this.listTables[i][j].value : undefined;
                this.inputProperty.values = [];
            }

            //Проверка на возможность вставки
            let rules = { copy: true, cut: true, paste: false }
            if(this.inputProperty.oldValue == undefined) rules.copy = rules.cut = false;
            else
                if(localStorage.getItem("copyTable") && this.listTables[i][j].id != localStorage.getItem("copyTable")) rules.paste = true;
            this.onChange.emit({ type: "operation", rules: rules});

            setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
            return true;
        }
        return false;
    }
    acceptEditField(e) // пропал фокус с выделенной ячейки
    {
        if(e.relatedTarget)
            if(e.relatedTarget.getAttribute("id") == this.mainElementIds.mainInputElement) return;
            else if(e.relatedTarget.getAttribute("id") == this.mainElementIds.mainSelectElement) return;
                else if(e.relatedTarget.getAttribute("id") == this.mainElementIds.mainButtonElement) return;
        this.inputProperty.visible = false;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            let type = "value";
            let out:any = { __type__: this.inputProperty.oldValue == undefined ? "insert" : "update", nameColumn: this.header[j].value };
            if(this.listTables[i][j] && this.listTables[i][j].type == "cell") out.__type__ = "update"; // Для ссылок на несуществующие элементы
            if(out.__type__ == "insert") out.__ID__ = this.firstData[i]; // Если вставляем новое значение, то надо знать номер строки
            if(out.__type__ == "update") out.id = this.listTables[i][j].id; // при обновлении достаточно знать id
            let valuesLength = this.inputProperty.values.length;
            let _i = 0;
            if(valuesLength > 0)
            {
                for(; _i < valuesLength; _i++)
                    if(this.inputProperty.values[_i] == this.inputProperty.value) break;
                if(_i != valuesLength) type = "list";
            }
            if(type == "value") out.value = this.inputProperty.value;
            if(type == "list") out.value = { value:_i, linkId:this.listTables[i][j].linkId, type:"value", listValue: this.inputProperty.values[_i] };
            this.onChange.emit({ type: "field", out: out, i: i, nameColumn: this.header[j].value });
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
    openToExplorer(linkId)
    {
        this.onChange.emit({ type: "explorer", linkId: linkId });
    }
    getPositionInTable(element, out)
    {
        let i = -1;
        let j = -1;
        let a = element.getAttribute("id") ? element.getAttribute("id").split("_") : [];
        if(a.length == 2)
        {
            i = Number(a[0]);
            j = Number(a[1]);

            let mainOffset = $(this.mainContainer.nativeElement).offset();
            let scrollTop = this.mainContainer.nativeElement.scrollTop;
            let offset = $(element).offset();
            out.top = (offset.top - mainOffset.top + scrollTop) + "px";
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
    height = "";
    functionResize;
    resize()
    {
        this.height = document.documentElement.clientHeight - 100 + "px";
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
    }
    dragoverHandler(e) { e.preventDefault(); } // для того чтобы подсвечивалось cursor
}
