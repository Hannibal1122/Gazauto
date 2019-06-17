import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;

@Injectable()
export class PasteObjectService {
    Data:any = {
        title: "Копирование",  
        data: [
            ["", { selected: "Копировать", data: [] }, "select", { onselect: (value) =>
            {
                this.modal.Data[1][1] = this.getInfo(value);
            }}],
            ["Описание", "Копирует по значению", "html"],
            ["Новое имя", "", "text"]
        ], 
        ok: "Копировать",
        cancel: "Отмена"
    };
    constructor(public query: QueryService) 
    { 
    }
    modal;
    getInfo(value)
    {
        switch(value)
        {
            case "Копировать": 
                return "Копирует по значению";
            case "Наследовать":
                return "Создает новый элемент, с сылкой на значение";
            case "Копировать структуру":
                return "Создает все входящие дирректории и элементы без значений";
        }
    }
    paste(parent, update, loadUpdate) // сюда id parent
    {
        let copyExplorer = JSON.parse(localStorage.getItem("copyExplorer"));
        let type = localStorage.getItem("lastOperationExplorer");
        let selectValue = [];
        switch(copyExplorer.objectType)
        {
            /* case "folder":
                selectValue = ["Копировать", "Копировать структуру", "Наследовать"];
                break; */
            case "folder":
                selectValue = ["Копировать", "Копировать структуру"];
                break;
            case "table":
                selectValue = ["Копировать"];
                if(copyExplorer.bindId == null) selectValue.push("Наследовать"); // Нельзя наследовать от наследуемой
                break;
            case "value":
                selectValue = ["Копировать"];
                break;
        }
        this.Data.data[0][1].data = selectValue;
        this.Data.data[0][1].selected = "Копировать";
        this.Data.data[1][1] = this.getInfo(this.Data.data[0][1].selected);
        if(selectValue.length > 1 && type != "cut")
            this.modal.open(this.Data, (save) =>
            {
                if(save) this.copyOrPaste(copyExplorer.id, parent, type, () => { update(); loadUpdate(); });
                else loadUpdate();
            })
        else this.copyOrPaste(copyExplorer.id, parent, type, () => { update(); loadUpdate(); });
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
        this.query.protectionPost(114, { param: [ id, parent, type, this.Data.data[2][1] ] }, (data) =>
        {
            if(data == "ERROR") this.modal.open({ title: "Ошибка! Конечная папка является дочерней для копируемой!", data: [], ok: "Ок", cancel: ""});
            if(func) func();
            localStorage.removeItem("copyExplorer");
        });
    }
}