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
    paste(update)
    {
        let copyExplorer = JSON.parse(localStorage.getItem("copyExplorer"));
        localStorage.removeItem("copyExplorer");
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
                break;
        }
        this.Data.data[0][1].data = selectValue;
        trace(this.modal)
        if(selectValue.length > 0)
            this.modal.open(this.Data, (save) =>
            {
                update();
            })
        else update();
    }

}