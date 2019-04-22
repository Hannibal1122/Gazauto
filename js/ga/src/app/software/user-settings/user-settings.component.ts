import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
declare var $:any;
@Component({
    selector: 'user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.css'],
    providers: [ QueryService ]
})
export class UserSettingsComponent implements OnInit 
{
    constructor(private query:QueryService) 
    {
    }
    ngOnInit() 
    {
        
    }
}