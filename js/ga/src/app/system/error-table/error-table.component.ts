import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
declare var trace:any;
declare var $:any;
@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.css']
})
export class ErrorTableComponent implements OnInit 
{
    @ViewChild("mainContainer") mainContainer:ElementRef;
    /* @ViewChild("mainEditElement") mainEditElement:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef; */
    
    @Output() onChange = new EventEmitter<any>();
    header = [];
    firstHeader = {};
    mainData;
    listTables = [];
    firstData = [];
    mainEditElement:any = null;
    mainInputElement:any = null;

    constructor() { }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        /* this.clickOutInput = (e) => 
        { 
            if(!this.editField(e))
        }; */
        window.addEventListener("resize", this.functionResize, false);
        /* window.addEventListener("click", this.clickOutInput, false); */
        /* window.addEventListener("mousemove", this.mouseMove, false); */

        this.mainEditElement = document.getElementById("mainEditElement");
        this.mainInputElement = document.getElementById("mainInputElement");
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
        /* trace(this.header)
        trace(this.firstHeader) */
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
        /* trace(this.listTables)
        trace(this.firstData) */
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
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.getPositionInTable(e.target, this.configInput))
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            this.inputProperty.visible = true;
            this.inputProperty.type = this.listTables[i][j].type;
            if(this.listTables[i][j].values) 
            {
                let _i = 0;
                this.inputProperty.values = this.listTables[i][j].values;
                this.inputProperty.oldValue = this.inputProperty.value = this.inputProperty.values[Number(this.listTables[i][j].value)];
            }
            else 
            {
                this.inputProperty.oldValue = this.inputProperty.value = this.listTables[i][j] ? this.listTables[i][j].value : undefined;
                this.inputProperty.values = [];
            }
            setTimeout(() => { this.mainInputElement.focus(); }, 20);
            return true;
        }
        return false;
    }
    acceptEditField(e) // пропал фокус с выделенной ячейки
    {
        if(e.relatedTarget)
            if(e.relatedTarget.getAttribute("id") == "mainInputElement") return;
            else if(e.relatedTarget.getAttribute("id") == "mainSelectElement") return;
                else if(e.relatedTarget.getAttribute("id") == "mainButtonElement") return;
        /* trace(this.inputProperty) */
        this.inputProperty.visible = false;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            let type = "value";
            let out = [{ __ID__: this.firstData[i], __type__: this.inputProperty.oldValue == undefined ? "insert" : "update" }];
            
            let valuesLength = this.inputProperty.values.length;
            let _i = 0;
            if(valuesLength > 0)
            {
                for(; _i < valuesLength; _i++)
                    if(this.inputProperty.values[_i] == this.inputProperty.value) break;
                if(_i != valuesLength) type = "list";
            }
            if(type == "value")
            {
                out[0][this.header[j].value] = this.inputProperty.value;
                this.listTables[i][j] = { value: this.inputProperty.value };
                this.mainData[i][this.header[j].value] = { value: this.inputProperty.value }; // Изменить данные в главном массиве
            }
            if(type == "list")
            {
                out[0][this.header[j].value] = { value:_i, id:this.listTables[i][j].id, type:"value" };
                this.listTables[i][j].value = _i;
                this.mainData[i][this.header[j].value].value = _i; // Изменить данные в главном массиве
            }
            this.onChange.emit({ out: out });
        }
    }
    removeRow(i)
    {
        this.onChange.emit({ type: "remove", idRow: i });
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
        /* trace(element) */
        return false;
    }
    //////////////////////////////////
    height = "";
    functionResize;
    /* clickOutInput; */
    resize()
    {
        this.height = document.documentElement.clientHeight - 100 + "px";
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
        /* window.removeEventListener("click", this.clickOutInput, false); */
        /* window.removeEventListener("mousemove", this.mouseMove, false); */
    }
    dragoverHandler(e) { e.preventDefault(); } // для того чтобы подсвечивалось cursor
}
