import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
import { Subscription } from 'rxjs';

declare var trace:any;

@Injectable()
export class GlobalEvent
{
    autoUpdate:AutoUpdate;
    subscribeData = {
        time: "",
        structure: null,
        tableEvent: {},
        tables: []
    }
    constructor(public query: QueryService) 
    {
        this.autoUpdate = new AutoUpdate(() => {
            this.update()
        }, 10000); 
        this.query.protectionPost(353, { }, (data) =>
        {
            if(!Array.isArray(data)) return;
            this.subscribeData.time = data[0][0];
            this.update();
            this.autoUpdate.start();
        });
    }
    update()
    {
        this.query.protectionPost(354, { param: [ this.subscribeData.time, this.subscribeData.tables ] }, (data) =>
        {
            if(typeof data !== "object") return;
            this.subscribeData.time = data.time;
            if(data.structure) this.subscribeData.structure();
            for(let key in data.table)
                this.subscribeData.tableEvent[key](data.table[key]);
        });
    }
    subscribe(type:String, id:Number, event)
    {
        switch(type)
        {
            case "structure":
                this.subscribeData.structure = event;
                break;
            case "table":
                if(this.subscribeData.tableEvent[String(id)]) return;
                this.subscribeData.tableEvent[String(id)] = event;
                this.subscribeData.tables.push({
                    id: id,
                    tableIds: {}, // Массив с таблицами, на которые есть ссылки
                    idLogTableOpen: -1 // id записи в логе для подтверждения что таблица открыта на клиенте
                });
                break;
        }
    }
    unsubscribe(type:String, id:Number)
    {
        switch(type)
        {
            case "structure":
                this.subscribeData.structure = null;
                break;
            case "table":
                delete this.subscribeData.tableEvent[String(id)];
                for(let i = 0; i < this.subscribeData.tables.length; i++)
                    if(this.subscribeData.tables[i].id == id)
                    {
                        this.subscribeData.tables.splice(i, 1);
                        break;
                    }
                break;
        }
    }
    appendTableIds(id, tableIds, idLogTableOpen) // tableIds может быть известен только после загрузки таблицы поэтому отдельно
    {
        for(let i = 0; i < this.subscribeData.tables.length; i++)
            if(this.subscribeData.tables[i].id == id)
            {
                this.subscribeData.tables[i].tableIds = tableIds;
                this.subscribeData.tables[i].idLogTableOpen = idLogTableOpen;
                break;
            }
    }
}
class AutoUpdate
{
    private timerUpdate;
    private func;
    private milliseconds;
    constructor(func, milliseconds)
    {
        clearTimeout(this.timerUpdate);
        this.timerUpdate = null;
        this.func = func;
        this.milliseconds = milliseconds ? milliseconds : 30000;
    }
    start()
    {
        this.stop();
        this.timerUpdate = setTimeout(() =>
        {
            this.func();
            this.start();
        }, this.milliseconds);
    }
    stop()
    {
        clearTimeout(this.timerUpdate);
    }
    setTime(milliseconds)
    {
        this.milliseconds = milliseconds;
    }
}