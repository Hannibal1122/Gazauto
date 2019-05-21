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
    log = [];
    timer = null;
    first = false;
    visible = true;
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
            this.log = data.reverse();
            let time;
            for(let i = 0; i < this.log.length; i++)
            {
                time = this.func.getFormat(this.log[i][0]);
                this.log[i][0] = time.split(" ")[1];
                this.log[i].push(time);
            }
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
}
