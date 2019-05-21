import { Injectable } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Injectable()
export class QueueService
{
    queue = [];
    loaded = false;
    constructor(private query:QueryService)
    {

    }
    add(nquery, param, func) // Добавить запрос в очередь
    {
        this.queue.push({ nquery: nquery, param: param, func: func });
        if(this.queue.length == 1) this.update();
    }
    update()
    {
        this.loaded = false;
        let queue = this.queue[0];
        this.query.protectionPost(queue.nquery, { param: queue.param }, (data) => 
        {
            queue.func(data);
            this.queue.splice(0, 1);
            if(this.queue.length != 0) this.update();
            else this.loaded = true;
        });
    }
}