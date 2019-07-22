import { Component, OnInit } from '@angular/core';
import { QueryService } from "../../lib/query.service";
declare  var trace:any;
@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit 
{
    inputs = { id: -1};
    info:any = null;
    allPath = [];
    constructor(private query: QueryService) 
    { 

    }
    set inputFromApp(id)
    {
        if(id)
        {
            this.query.protectionPost(127, { param: [id] }, (data) => 
            {
                this.info = {
                    id: id,
                    objectType: data[0][0],
                    info: data[0][1],
                    state: data[0][2],
                    name: data[0][3]
                }
            });
            this.query.protectionPost(110, { param: [id] }, (data) => 
            { 
                this.allPath = data.path;
                this.allPath.push({id: 0, name: "Root"});
                this.allPath.reverse();
            });
        }
    }
    ngOnInit() 
    {
    }
}
