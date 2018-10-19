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
    nameFilter = "";
    selectFilter = [];
    selectFilterI = -1;
    selectFilterSaveI = -1;
    constructor(private query:QueryService) 
    {
        this.loadData();
    }
    ngOnInit() 
    {
        
    }
    loadData()
    {
        this.query.protectionPost(453, {}, (data) =>
        {
            this.selectFilter = [];
            for(var i = 0; i < data.length; i++)
                this.selectFilter.push(data[i][0]);
        });
        this.query.protectionPost(454, {}, (data) =>
        {
            if(data != "") this.selectFilterSaveI = data;
            /* for(var i = 0; i < data.length; i++)
                this.selectFilter.push(data[i][0]); */
        });
    }
    addFilter()
    {
        if(this.nameFilter != "")
            this.query.protectionPost(450, { param: [ this.nameFilter ] }, (data) =>
            {
                this.nameFilter = "";
                this.loadData();
            });
    }
    removeFilter()
    {
        if(this.selectFilterI != -1)
            this.query.protectionPost(451, { param: [ Number(this.selectFilterI) == -1 ? null : this.selectFilterI ] }, (data) =>
            {
                this.loadData();
            });
    }
    saveFilter()
    {
        if(this.selectFilterSaveI != -1)
            this.query.protectionPost(452, { param: [ this.selectFilterSaveI ] }, (data) =>
            {
            });
    }
}