import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
declare var Snap:any;
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
    bigCircle;
    up = false;
    constructor() { }
    ngOnInit() 
    {
        var s = Snap(this.loading.nativeElement);
        this.bigCircle = s.circle(60, 60, 50);
        this.bigCircle.attr({
            fill: "#bada55",
            stroke: "#4f5d23",
            strokeWidth: 5
        });
        this.update();
    }
    update()
    {
        this.bigCircle.animate({r: this.up ? 50 : 45}, 1000, 
        () => 
        { 
            this.up = !this.up;
            this.update();
        });
    }
}
