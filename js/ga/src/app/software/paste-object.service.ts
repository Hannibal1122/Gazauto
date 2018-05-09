import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';

declare var trace:any;

@Injectable()
export class PasteObjectService {
    Data:any = {
        title: "Копирование",  
        data: [
            ["", { selected: "Копировать", data: [] }, "select", { onselect: (value) =>
            {
                switch(value)
                {
                    case "Копировать": 
                        this.modal.Data[1][1] = "Копирует по значению";
                        break;
                    case "Наследовать":
                        this.modal.Data[1][1] = "Создает новый элемент, с сылкой на значение";
                        break;
                    case "Копировать структуру":
                        this.modal.Data[1][1] = "Создает все входящие дирректории и элементы без значений";
                        break;
                }
            }}],
            ["Описание", "Копирует по значению", "html"]
        ], 
        ok: "Копировать",
        cancel: "Отмена"
    };
    constructor(public query: QueryService) 
    { 
    }
    modal;
    paste(parent, update) // сюда id parent
    {
        let copyExplorer = JSON.parse(localStorage.getItem("copyExplorer"));
        let type = localStorage.getItem("lastOperationExplorer");
        let selectValue = [];
        switch(copyExplorer.objectType)
        {
            case "folder":
                selectValue = ["Копировать", "Копировать структуру", "Наследовать"];
                break;
            case "table":
                selectValue = ["Копировать", "Наследовать"];
                break;
            case "value":
                selectValue = ["Копировать"];
                break;
        }
        this.Data.data[0][1].data = selectValue;
        this.Data.data[0][1].selected = "Копировать";
        if(selectValue.length > 1 && type != "cut")
            this.modal.open(this.Data, (save) =>
            {
                if(save) this.copyOrPaste(copyExplorer.id, parent, type, () => { update(); });
            })
        else this.copyOrPaste(copyExplorer.id, parent, type, () => { update(); });
    }
    copyOrPaste(id, parent, type, func)
    {
        if(type != "cut")
            switch(this.Data.data[0][1].selected)
            {
                case "Копировать": type = "copy"; break;
                case "Копировать структуру": type = "struct"; break;
                case "Наследовать": type = "inherit"; break;
            }
        this.query.protectionPost(114, { param: [ id, parent, type ] }, (data) =>
        {
            trace(data)
            if(func) func();
            localStorage.removeItem("copyExplorer");
        });
    }
}