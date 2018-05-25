import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit 
{
    height = "";
    functionResize;
    constructor() { }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
    }
    resize()
    {
        this.height = document.documentElement.clientHeight - 100 + "px";
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
    }
}
