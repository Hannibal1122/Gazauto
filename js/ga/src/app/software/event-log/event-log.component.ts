import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';

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
    log = [];
    timer = null;
    first = false;
    constructor(public query: QueryService) { }
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
            this.log = data.reverse();
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
    ngOnDestroy() 
    {
        clearTimeout(this.timer);
    }
    getTime(date)
    {
        return date.split(" ")[1];
    }
}
