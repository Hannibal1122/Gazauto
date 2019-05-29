import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
declare var trace:any;

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit 
{
    @ViewChild("loading") public loading:ElementRef;
    @Input() set load(value)
    {
        this._load = value;
    }
    _load = false;
    constructor() { }
    ngOnInit() 
    {
    }
}
