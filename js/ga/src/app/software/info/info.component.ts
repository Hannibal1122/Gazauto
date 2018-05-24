import { Component, OnInit } from '@angular/core';
import { QueryService } from "../../lib/query.service";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit 
{
    inputs = { id: -1};
    constructor(private query: QueryService) 
    { 

    }
    ngOnInit() 
    {
    }
}
