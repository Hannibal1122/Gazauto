import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
import { FunctionsService } from '../../lib/functions.service';

declare var trace:any;
@Component({
    selector: 'app-event-log',
    templateUrl: './event-log.component.html',
    styleUrls: ['./event-log.component.css']
})
export class EventLogComponent implements OnInit 
{
    @ViewChild("mainContainer") mainContainer:ElementRef;
    @ViewChild("mainTable") mainTable:ElementRef;
    inputs:any = {};
    firstData = []; // firstData
    log = []; // drawData
    timer = null;
    first = false;
    visible = true; // Для перемещения экранов
    loaded = true;
    error = "";
    filterSettings = 
    {
        type: 'filter', // field
        beginDate: null, 
        endDate: null,
        beginDateText: null, 
        endDateText: null,
        show: false,
        eventTypes: 
        {
            enter: true,
            open: true,
            text: true,
            warning: true,
            error: true,
            remove: true,
            update: true,
            state: true,
            script: true,
            cut: true,
            copy: true,
            create: true
        },
        types: 
        {
            table: true,
            structure: true,
            user: true,
            filter: true,
            event: true,
            message: true,
            plan: true,
            file: true,
            field: true,
            right: true,
            value: "", // фильтр по значению
            login: "", // фильтр по логину
        },
        fieldData: {} // Старое значение ячейки
    }
    showFilterSettings = false;
    constructor(public query: QueryService, public func:FunctionsService) { }
    ngOnInit() 
    { 
        let date = this.func.getFormatForMilliseconds(new Date().getTime(), "dd.MM.yyyy HH:mm");
        this.filterSettings.beginDateText = date;
        this.filterSettings.endDateText = date;
        this.loaded = false;
        this.update();
    }
    start()
    {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.update();
        }, 15000)
    }
    update()
    {
        clearTimeout(this.timer);
        this.query.protectionPost(480, { param: [this.inputs.id] }, (log) =>
        {
            let eventTypes = log.event_log_event_types;
            let types = log.event_log_types;
            let data = log.data;

            if(eventTypes) for(let key in eventTypes) this.filterSettings.eventTypes[key] = eventTypes[key];
            if(types) for(let key in types) this.filterSettings.types[key] = types[key];

            this.inputs.name = "Журнал";
            this.parseLogData(data.reverse());
            this.loaded = true;
            if(!this.first)
                setTimeout(() => 
                {
                    let height = this.mainContainer.nativeElement.clientHeight;
                    this.mainContainer.nativeElement.scrollTop = this.mainTable.nativeElement.clientHeight - height;
                }, 100);
            this.first = true;
            this.start();
        });
    }
    parseLogData(data?)
    {
        if(data) this.firstData = data;
        this.log = [];
        let date;
        for(let i = 0; i < this.firstData.length; i++)
        {
            date = this.func.getFormat(this.firstData[i].date);
            this.log.push({ time: date.split(" ")[1], date: date, ...this.firstData[i] });
        }
        if(this.log.length == 0) this.error = "Журнал пуст. Проверьте фильтры.";
        else this.error = ""; 
    }
    onChangeFilterEventType()
    {
        this.query.protectionPost(450, { param: [ "event_log_event_types", JSON.stringify(this.filterSettings.eventTypes) ] });
    }
    onChangeFilterType()
    {
        this.query.protectionPost(450, { param: [ "event_log_types", JSON.stringify(this.filterSettings.types) ] });
    }
    openFilterSettings()
    {
        this.filterSettings.show = true;
        this.filterSettings.type = 'filter';
        clearTimeout(this.timer);
    }
    searchByFilter()
    {
        this.filterSettings.show = false;
        this.loaded = false;
        this.query.protectionPost(481, { param: [this.inputs.id, this.filterSettings.beginDate, this.filterSettings.endDate] }, (data) =>
        {
            if(data === "MORE_1000") 
            {
                this.log = [];
                this.error = "Вы запрашиваете больше 1000 значений. Измените период запроса!";
            }
            else this.parseLogData(data);
            this.loaded = true;
        });
    }
    clearFilterSettings()
    {
        this.filterSettings.show = false;
        this.update();
    }
    closeFilterSettings()
    {
        this.filterSettings.show = false;
    }
    changeBeginDate(date)
    {
        this.filterSettings.beginDate = this.func.getFormatForMilliseconds(date.milliseconds);
    }
    changeEndDate(date)
    {
        this.filterSettings.endDate = this.func.getFormatForMilliseconds(date.milliseconds);
    }
    ngOnDestroy() 
    {
        clearTimeout(this.timer);
    }
    openObject(object)
    {
        if(object.type == 'table')
            this.query.onChange({ type: "openFromTable", value: { type: "open", name: object.type, id: Number(object.value) }});
        if(object.type == 'structure' || object.type == 'field')
            this.query.onChange({ type: "openFromTable", value: { name: object.type == 'structure' ? "folder" : "cell", id: Number(object.value) }});
    }
    openValueField(object)
    {
        if(object.type == 'field')
            this.query.protectionPost(482, { param: [ this.inputs.id, object.id ] }, (data) => {
                this.filterSettings.show = true;
                this.filterSettings.type = 'field';
                this.filterSettings.fieldData = { idLog: object.id, ...data };
            });
    }
    backOldValue()
    {
        trace(this.filterSettings.fieldData)
    }
}
