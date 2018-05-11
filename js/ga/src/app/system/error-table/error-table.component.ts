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
    @ViewChild("mainEditElement") mainEditElement:ElementRef;
    @ViewChild("mainInputElement") mainInputElement:ElementRef;
    @ViewChild("mainOverElement") mainOverElement:ElementRef;
    
    @Output() onChange = new EventEmitter<any>();
    header = [];
    firstHeader = {};
    mainData;
    listTables = [];
    firstData = [];

    constructor() { }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
        /* window.addEventListener("mousemove", this.mouseMove, false); */
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
        visible: false
    }
    editField(e) // нажали на ячейку для редактирования
    {
        if(this.getPositionInTable(e.target, this.configInput))
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            this.inputProperty.oldValue = this.inputProperty.value = this.listTables[i][j].value ? this.listTables[i][j].value : this.listTables[i][j];
            this.inputProperty.visible = true;
            setTimeout(() => { this.mainInputElement.nativeElement.focus(); }, 20);
        }
    }
    acceptEditField() // пропал фокус с выделенной ячейки
    {
        /* trace(this.inputProperty) */
        this.inputProperty.visible = false;
        if(this.inputProperty.oldValue != this.inputProperty.value)
        {
            let i = this.configInput.i;
            let j = this.configInput.j;
            let out = [{ __ID__: this.firstData[i], __type__: this.inputProperty.oldValue == undefined ? "insert" : "update" }];
            out[0][this.header[j].value] = this.inputProperty.value;
            this.mainData[i][this.header[j].value] = this.inputProperty.value; // Изменить данные в главном массиве
            this.onChange.emit({
                out: out
            });
            this.listTables[i][j] = this.inputProperty.value;
        }
    }
    removeRow(i)
    {
        this.onChange.emit({
            type: "remove",
            idRow: i
        });
    }
    configOverElement = 
    {
        width: "100px",
        height: "10px",
        top: "-1000px",
        left: "0px",
        border: "2px solid #45ac4e"
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
    resize()
    {
        this.height = document.documentElement.clientHeight - 100 + "px";
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
        /* window.removeEventListener("mousemove", this.mouseMove, false); */
    }
    dragoverHandler(e) { e.preventDefault(); } // для того чтобы подсвечивалось cursor
}
