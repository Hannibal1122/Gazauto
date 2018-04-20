import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
declare var trace:any;
@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.css']
})
export class ErrorTableComponent implements OnInit 
{
    @ViewChild('selectPageElem') public selectPageElem: ElementRef;
    header = [];
    filter = [];
    listTables = [];
    firstData = [];
    filterTeg = [];
    height = null;
    rowInPage;
    countPage = 0;
    currentPage = 0;
    numberPages = [];
    events = 
    {
        clickRow: null
    }
    _filter = false; // Введено ли значение в фильтр
    constructor() { }
    ngOnInit() 
    {
    }
    @Input() set config(value)
    {
        if(value)
        {
            if(value.header)
                for(var i = 0; i < value.header.length; i++)
                    this.header.push(value.header[i]);
            if(value.filter)
                for(var i = 0; i < value.filter.length; i++)
                    this.filter.push(value.filter[i]);
            if(value.height) this.height = value.height;
            if(value.rowInPage) this.rowInPage = value.rowInPage;
            this.events.clickRow = value.clickRow;
        }
    }
    @Input() set data(value)
    {
        if(value)
        {
            this.firstData = [];
            this.listTables = [];
            for(var i = 0; i < value.length; i++)
            {
                this.firstData[i] = value[i];
                this.listTables[i] = value[i];
            }
            if(this.rowInPage)
            {
                this.setCountPage(value.length);
                this.setPage(0);
            }
        }
    }
    setCountPage(length)
    {
        this.numberPages = [];
        this.countPage = Math.ceil(length / this.rowInPage);
        for(var i = 0; i < this.countPage; i++) this.numberPages[i] = i;
    }
    setPage(page)
    {
        if(page != undefined) this.currentPage = page;
        else this.currentPage = Number(this.selectPageElem.nativeElement.value);
        this.listTables = [];
        var l = this.currentPage * this.rowInPage + this.rowInPage;
        if(this._filter)
            this.UpdateFilter(null, null, this.currentPage * this.rowInPage, l)
        else
            for(var i = this.currentPage * this.rowInPage; i < l; i++) // Если фильтр пустой
            {
                if(this.firstData[i]) 
                    this.listTables[i] = this.firstData[i];
            }
    }
    UpdateFilter(_i, _value, begin, end)
    {
        if(_i != null) this.filterTeg[_i] = _value;
        this.listTables = [];
        var add = true;
        var length = 0;
		for(var i = 0; i < this.firstData.length; i++)
        {
            for(var j = 0; j < this.firstData[i].length; j++)
                if(this.filterTeg[j] == undefined || this.firstData[i][j].toLowerCase().indexOf(this.filterTeg[j].toLowerCase()) != -1) add = add && true;
                else add = false;
            if(add)
            {
                if(length >= begin && length < end) 
                    this.listTables.push(this.firstData[i]);
                length++;
            }
            add = true;
        }
        if(begin == 0)
        {
            this.currentPage = 0;
            this.selectPageElem.nativeElement.value = "0";
            this.setCountPage(length);
        }
        if(this.listTables.length == this.firstData.length) this._filter = false;
        else this._filter = true;
    }
}
