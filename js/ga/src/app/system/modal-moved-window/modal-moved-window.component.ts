import { Component, OnInit } from '@angular/core';
declare var trace:any;
@Component({
    selector: 'modal-moved-window',
    templateUrl: './modal-moved-window.component.html',
    styleUrls: ['./modal-moved-window.component.css'],
    providers: []
})
export class ModalMovedWindowComponent implements OnInit
{
    inputValue = "";
    value;
    open = false;
    change = null;
    settings = 
    {
        top: document.documentElement.clientHeight / 2,
        left: document.documentElement.clientWidth / 2,
        click: false,
        error: 
        {
            x: 0,
            y: 0
        }
    }
    onMouseMove = (e) =>
    {
        if(this.settings.click)
        {
            this.settings.left = e.clientX - this.settings.error.x;
            this.settings.top = e.clientY - this.settings.error.y;
        }
    }
    constructor()
    {
        document.addEventListener("mousemove", this.onMouseMove);
    }
    ngOnInit()
    {
    }
    changeDate(e)
    {
        this.value = e.date + " " + e.time;
    }
    mouseDown(e)
    {
        this.settings.click = true;
        this.settings.error.x = e.clientX - this.settings.left;
        this.settings.error.y = e.clientY - this.settings.top;
    }
    acceptDatetime()
    {
        if(this.change) this.change(this.value);
        this.open = false;
    }
    ngOnDestroy()
    {
        document.removeEventListener("mousemove", this.onMouseMove);
    }
}