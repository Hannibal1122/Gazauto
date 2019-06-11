import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace;
@Component({
    selector: 'app-table-header-editor',
    templateUrl: './table-header-editor.component.html',
    styleUrls: ['./table-header-editor.component.css'],
    providers: [ QueryService ]
})
export class TableHeaderEditorComponent implements OnInit 
{
    @Output() updateTable = new EventEmitter<any>();
    @Input() set tableId(value)
    {
        if(value)
            this.id = value;
    }
    @Input() set header(value)
    {
        if(value)
        {
            this.dataHeader = [];
            for(let i = 0; i < value.length; i++)
                this.dataHeader[i] = { value: value[i].name, type: value[i].dataType, id: value[i].id };
            this.change = false;
            this.changes = [];
            this.error = false;
        }
    }
    id = -1;
    dataHeader = [];
    change = false;
    changes = [];
    error = false;
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
    }
    growUp(i)
    {
        if(i == 0) return;
        let a = this.dataHeader[i - 1];
        this.dataHeader[i - 1] = this.dataHeader[i];
        this.dataHeader[i] = a;
        this.onChangeInput();
    }
    growDown(i)
    {
        if(i == this.dataHeader.length - 1) return;
        let a = this.dataHeader[i + 1];
        this.dataHeader[i + 1] = this.dataHeader[i];
        this.dataHeader[i] = a;
        this.onChangeInput();
    }
    removeRow(i)
    {
        if(this.dataHeader[i].id) this.changes.push(this.dataHeader[i].id);
        this.dataHeader.splice(i, 1);
        this.onChangeInput();
    }
    onChangeInput(i?)
    {
        if(i !== undefined) this.dataHeader[i].oldValue = this.dataHeader[i].value;
        this.change = true;
    }
    addHead()
    {
        this.dataHeader.push({ value: "", type: null });
        this.change = true;
    }
    saveHead()
    {
        // Проверка на уникальность столбцов на сервере(дополнительно)
        if(this.isDublicate(this.dataHeader)) 
        {
            this.error = true;
            return;
        }
        this.error = false;
        this.query.protectionPost(251, { param: [ this.id, JSON.stringify(this.dataHeader), this.changes ]}, (data) => 
        {
            if(data === "ERROR_DUBLICATE") 
            {
                this.error = true;
                return;
            }
            this.updateTable.emit();
            this.change = false;
            this.changes = [];
            this.error = false;
        });
    }
    isDublicate(values)
    {
        var valueArr = values.map((item) => item.value);
        return valueArr.some((item, idx) => valueArr.indexOf(item) != idx);
    }
}