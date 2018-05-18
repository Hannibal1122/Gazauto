import { Component, ViewChild, ElementRef } from '@angular/core';
import { FunctionsService } from "../../lib/functions.service";

declare var trace:any;
declare var $: any;
@Component({
    selector: 'modalwindow',
    templateUrl: './modalwindow.component.html',
    styleUrls: ['./modalwindow.component.css'],
    providers: [FunctionsService]
})
export class ModalWindowComponent
{
    @ViewChild('modal') public modal: ElementRef;
    closeFunction = null;
    title = "Модальное окно";
    textButtonOK = "Да";
    textButtonCancel = "Нет";
    Data = [];
    BeginData = [];
    error = "";
    width = 500;
    load = false;
    typeObject = [
        { name: "Папка", class: "fas fa-folder"}, 
        { name: "Таблица", class: "fas fa-table"}, 
        { name: "Значение", class: "fas fa-superscript"}, 
        { name: "Событие", class: "fas fa-bolt"}, 
        { name: "Пользователь", class: "fas fa-user"}, 
        { name: "Роль", class: "fas fa-address-book"}, 
        { name: "Файл", class: "fas fa-file-alt"}, 
        { name: "Справка", class: "fas fa-info"}, 
    ]
    constructor(private lib:FunctionsService)
    {
    }
    open(data, closeFunction)
    {
        this.error = "";
        this.title = data.title;
        if(data.ok !== undefined) this.textButtonOK = data.ok;
        if(data.cancel !== undefined) this.textButtonCancel = data.cancel;
        if(data.width !== undefined) this.width = data.width;
        this.BeginData = data.data;
        this.Data = [];
        for(var i = 0; i < data.data.length; i++)
            this.Data[i] = data.data[i].slice();
        this.closeFunction = closeFunction;
        $("#BlockModalPanel").append(this.modal.nativeElement);
        $(this.modal.nativeElement).css({marginTop: "-500px"});
        $(this.modal.nativeElement).fadeIn(0);
        $(this.modal.nativeElement).animate({marginTop: "0px"}, 400);
        $("#BlockModalPanel").fadeIn(400);
        this.refreshFromListTable();
    }
    /******************************************************/
    inputInListTable = "";
    selectInListTable;
    changeInListTable = false;
    inputInListTableOld = "";
    addToListTable(i)
    {
        if(!this.changeInListTable)
        {
            let j = this.searchInListTable(i, this.inputInListTable);
            if(j == this.Data[i][1].length) this.Data[i][1].push({ value: this.inputInListTable });
        }
        else
        {
            let j = this.searchInListTable(i, this.selectInListTable);
            if(!this.Data[i][1][j].oldValue) this.Data[i][1][j].oldValue = this.Data[i][1][j].value;
            this.Data[i][1][j].value = this.inputInListTable;
        }
        this.refreshFromListTable();
    }
    removeFromListTable(i)
    {
        var j = this.searchInListTable(i, this.selectInListTable);
        this.Data[i][3].push(this.Data[i][1][j].value)
        this.Data[i][1].splice(j, 1);
    }
    upFromListTable(i)
    {
        var j = this.searchInListTable(i, this.selectInListTable);
        if(j == 0) return;
        this.Data[i][1][j] = this.Data[i][1][j - 1];
        this.Data[i][1][j - 1] = { value: this.selectInListTable };
    }
    downFromListTable(i)
    {
        var j = this.searchInListTable(i, this.selectInListTable);
        if(j == this.Data[i][1].length - 1) return;
        this.Data[i][1][j] = this.Data[i][1][j + 1];
        this.Data[i][1][j + 1] = { value: this.selectInListTable };
    }
    selectFromListTable()
    {
        this.inputInListTable = this.selectInListTable;
        this.changeInListTable = true;
    }
    refreshFromListTable()
    {
        this.inputInListTable = "";
        this.selectInListTable = "";
        this.changeInListTable = false;
    }
    searchInListTable(i, text)
    {
        for(var j = 0; j < this.Data[i][1].length; j++)
            if(this.Data[i][1][j].value == text) break;
        return j;
    }
    /******************************************************/
    close(save)
    {
        var out;
        if(save)
            for(var i = 0; i < this.Data.length; i++)
                if(this.Data[i][1] !== null) 
                    this.BeginData[i][1] = this.Data[i][1];
        if(this.closeFunction) 
            out = this.closeFunction(save);
        if(out === undefined || out === true)
        {
            $(this.modal.nativeElement).fadeOut(0);
            $("#BlockModalPanel").fadeOut(0);
            $("#BlockModalPanel").empty();
        }
        else this.error = out;
    }
    generatePassword(i) // Для password
    {
        this.Data[i][1] = this.lib.getUnicName("");
    }
    changeDate(data, e) // Для datetime
    {
        data[1] = e.milliseconds;
    }
    addToSelectList(data) // Для choiceListSelect
    {
        if(!data[1].current1) return;
        for(i = 0; i < data[1].selected.length; i++)
            if(data[1].selected[i].value == data[1].current1) return;
        if(data[1].value)
        {
            for(var i = 0; i < data[1].value.length; i++)
                if(data[1].value[i] == data[1].current1) break;
            data[1].selected.push({value: data[1].value[i], name: data[1].data[i]});
        }
        else data[1].selected.push({value: data[1].current1, name: data[1].current1});
    }
    removeFromSelectList(data)
    {
        if(!data[1].current2) return;
        for(var i = 0; i < data[1].selected.length; i++)
            if(data[1].selected[i].value == data[1].current2) break;
        if(i != data[1].selected.length)
            data[1].selected.splice(i, 1);
    }
    onChangeListFile(listFile, data)
    {
        data[1] = listFile;
    }
    removeRights(data, i)
    {
        data.splice(i, 1);
    }
    onLoad(data)
    {
        if(data.data == 1) this.load = true;
        else this.load = false;
        if(data.error != undefined && data.error != "")
            this.error = data.error;
    }
}