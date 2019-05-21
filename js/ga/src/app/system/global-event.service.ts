import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service';
import { Subscription } from 'rxjs';

declare var trace:any;

@Injectable()
export class GlobalEvent
{
    autoUpdate:AutoUpdate;
    autoUpdateIframe:AutoUpdate;
    autoUpdateOnline:AutoUpdate;
    subscribeData = {
        time: "",
        structure: null,
        online: null,
        tableEvent: {},
        tables: []
    }
    updateIFrame = null;
    constructor(public query: QueryService) 
    {
        this.autoUpdate = new AutoUpdate(() => {
            this.update()
        }, 10000);
        this.autoUpdateIframe = new AutoUpdate(() => {
            if(this.updateIFrame) this.updateIFrame();
        }, 100);
        this.autoUpdateOnline = new AutoUpdate(() => {
            if(this.subscribeData.online) this.subscribeData.online();
        }, 60000); // Раз в минуту обновляются данные о пользователе
        this.query.protectionPost(353, { }, (data) =>
        {
            if(!Array.isArray(data)) return;
            this.subscribeData.time = data[0][0];
            this.update();
            this.autoUpdate.start();
        });
        this.autoUpdateIframe.start();
        this.autoUpdateOnline.start();
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
            case "online":
                this.subscribeData.online = event;
                event();
                break;
            case "iframe":
                this.updateIFrame = event;
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
            case "online":
                this.subscribeData.online = null;
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