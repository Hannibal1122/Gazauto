import { Component, ViewChild, ElementRef } from '@angular/core';
import { FunctionsService } from "../../lib/functions.service";
import { FilterEditorComponent } from '../../software/filter-editor/filter-editor.component';

declare var trace:any;
@Component({
    selector: 'modalwindow',
    templateUrl: './modalwindow.component.html',
    styleUrls: ['./modalwindow.component.css'],
    providers: [FunctionsService]
})
export class ModalWindowComponent
{
    @ViewChild('modal') public modal: ElementRef;
    @ViewChild('filterEditor') public filterEditor: FilterEditorComponent;
    
    closeFunction = null;
    title = "Модальное окно";
    textButtonOK = "Да";
    textButtonCancel = "Нет";
    Data = [];
    BeginData = [];
    error = "";
    width = 500;
    load = false;
    _open = false;
    animationOpen = 0;
    constructor(private lib:FunctionsService) { }
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

        this._open = true;
        this.animationOpen = 0;
        setTimeout(() => {
            this.animationOpen = 1;
        }, 0);
    }
    close(save)
    {
        var out;
        if(save)
            for(var i = 0; i < this.Data.length; i++)
            {
                if(this.Data[i][1] !== null) 
                {
                    if(!this.BeginData[i]) this.BeginData[i] = [];
                    this.BeginData[i][1] = this.Data[i][1];
                    if(this.Data[i][2] == "filterEditor") this.BeginData[i][1] = this.filterEditor.getCondition();
                }
            }
        if(this.closeFunction) 
            out = this.closeFunction(save);
        if(out === undefined || out === true)
        {
            this.animationOpen = 0;
            setTimeout(() => {
                this._open = false;
            }, 400);
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
    selectAll(data) // Для import снять/выбрать все
    {
        for(var i = 0; i < data[1].length; i++) data[1][i].checked = data[3];
    }
    checkAll(data) // Для import снять/установить selectAll
    {
        data[3] = true;
        for(var i = 0; i < data[1].length; i++) data[3] &= data[1][i].checked;
    }
}