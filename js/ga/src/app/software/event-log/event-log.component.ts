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
    visible = true;
    filterSettings = 
    {
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
            script: true
        }
    }
    showFilterSettings = false;
    constructor(public query: QueryService, public func:FunctionsService) { }
    ngOnInit() 
    { 
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
        this.query.protectionPost(480, { param: [this.inputs.id] }, (data) =>
        {
            this.inputs.name = "Журнал";
            this.parseLogData(data.reverse());
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
            if(this.filterSettings.eventTypes[this.firstData[i][3]]) // фильтрация по типу события
            {
                date = this.func.getFormat(this.firstData[i][0]);
                this.log.push({
                    time: date.split(" ")[1],
                    login: this.firstData[i][1],
                    objectType: this.firstData[i][2],
                    eventType: this.firstData[i][3],
                    data: this.firstData[i][4],
                    date: date
                })
            }
        }
    }
    onChangeFilterEventType()
    {
        this.parseLogData();
    }
    openFilterSettings()
    {
        this.filterSettings.show = true;
        clearTimeout(this.timer);
    }
    searchByFilter()
    {
        this.filterSettings.show = false;
        this.query.protectionPost(481, { param: [this.inputs.id, this.filterSettings.beginDate, this.filterSettings.endDate] }, (data) =>
        {
            this.parseLogData(data);
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
}
