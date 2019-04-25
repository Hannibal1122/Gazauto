import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;

@Injectable()
export class CreateTableListService 
{
    constructor(public query: QueryService) 
    { 
    }
    modal;
    create(_idParent, update, tableId, data)
    {
        let table = { id: tableId, name: "" };
        this.query.protectionPost(126, { param: [ table.id ] }, (tableName) => 
        {
            table.name = tableName;
            this.query.protectionPost(253, { param: [ table.id ] }, (listColumn) => 
            {
                let ids = [];
                let nameColumn = [];
                for(var i = 0; i < listColumn.length; i++)
                {
                    ids[i] = listColumn[i][0];
                    nameColumn[i] = listColumn[i][1];
                }

                let idParent = _idParent != undefined ? _idParent : data.parent;
                let Data:any = {
                    title: "<b>" + (data ? "Изменение" : "Добавление") + " списка</b>",  
                    data: [
                        ["Имя", data ? data.name : "", data ? "html" : "text"], 
                        ["Имя таблицы", table.name, "html"], 
                        ["Имя столбца", { selected: ids[0], data: nameColumn, value: ids}, "select"]],
                    ok: data ? "Изменить" : "Добавить",
                    cancel: "Отмена"
                };
                if(data) Data.data[2][1].selected = data.fieldId;
                this.modal.open(Data, (save)=>
                {
                    if(save)
                    {
                        if(Data.data[0][1] == "") return "Введите имя!";
                        /* let out = this.modal.Data[2][1]; */
                        if(data)
                            this.query.protectionPost(306, { param: [ data.id, Data.data[2][1].selected ] }, (data) => 
                            {
                                update();
                            });
                        else
                            this.query.protectionPost(100, { param: ["tlist", "NULL", Data.data[0][1], idParent, 0, ""] }, (data) => 
                            {  
                                if(data[0] == "Index")
                                    this.query.protectionPost(305, { param: [ data[1], "tlist", Data.data[2][1].selected, table.id ] }, (data) => 
                                    {
                                        update();
                                    });
                            });
                    }
                });
            });
        });
    }
    remove(id, update)
    {
        var Data:any = {
            title: "Вы действительно хотите удалить элемент? (" + id + ")",  
            data: [],
            ok: "Да",
            cancel: "Отмена"
        };
        this.modal.open(Data, (save) =>
        {
            if(save)
                this.query.protectionPost(112, { param: [id] }, (data) => 
                { 
                    update();
                });
        });
    }
}
