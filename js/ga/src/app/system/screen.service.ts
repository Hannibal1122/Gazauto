import { Injectable } from '@angular/core';

declare var trace:any;

@Injectable()
export class SplitScreen
{
    currentScreen = 0;
    screens = [];
    rect = 
    {
        left: "0px",
        top: "0",
        width: "0",
        height: "0"
    }
    sector = 0;
    dragSettings = 
    {
        s: -1,
        i: -1,
        x: -1,
        y: -1
    };
    sectors = 
    [
        [0, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
    ]
    constructor()
    {
        this.appendScreen();
        document.addEventListener("dragenter", (event:any) => 
        {
            // highlight potential drop target when the draggable element enters it
            /* trace(event) */
            
        }, false);
        document.addEventListener("dragover", (event:any) => 
        {
            if(event.target.className != "DragScreen") return;
            let box = event.target.getBoundingClientRect();
            let mouseX = event.clientX - box.x;
            let mouseY = event.clientY - box.y;

            let w = box.width / 6;
            let h = box.height / 6;
            let x = Math.floor(mouseX / w);
            let y = Math.floor(mouseY / h);
            this.rect.left = x * w + "px";
            this.rect.top = y * h + "px";
            this.rect.width = (6 - x) * w + "px";
            this.rect.height = (6 - y) * h + "px";
            this.dragSettings.x = x;
            this.dragSettings.y = y;
            /* if(mouseX > Width / 2) 
            {
                this.rect.left = Width / 2 + "px";
                this.rect.width = Width / 2 + "px";
                this.rect.height = Height + "px";
                this.sector = 1;
            }
            else 
            {
                this.rect.left = 0 + "px";
                this.rect.width = Width + "px";
                this.rect.height = Height + "px";
                this.sector = 0;
            } */
        }, false);
        document.addEventListener("dragend", (event:any) => 
        {
            let x = this.dragSettings.x;
            let y = this.dragSettings.y;
            if(this.sectors[y][x] === null)
            {
                this.sector = this.screens.length;
                this.sectors[y][x] = this.sector;
                this.appendScreen();
            }
            else this.sector = this.sectors[y][x];
            this.calcSectors();
            trace(this.sectors)
            /* if(this.sector) */
            return;
            let s = this.dragSettings.s;
            let i = this.dragSettings.i;
            switch(this.sector)
            {
                case 0:
                    break;
                case 1: 
                    if(!this.screens[1]) 
                    {
                        this.appendScreen();
                        this.screens[0].column = { first: 1, end: 4 };
                        /* this.screens[0].rows = { first: , end:  }; */
                        this.screens[1].column = { first: 4, end: 7 };
                    }
                    trace(this.screens[1].tabs)
                    let tab = this.screens[s].tabs[i];
                    this.screens[1].tabs.push(tab);
                    this.screens[s].tabs.splice(i, 1);
                    this.screens[1].currentSoftware = this.screens[1].tabs.length - 1;
                    break;
            }
            this.onDragEnd();
        }, false);
    }
    calcSectors()
    {
        let sectors = this.sectors;
        for(let i = 0; i < sectors.length; i++)
        {
            let s = -1;
            let first = -1;
            for(let j = 0; j < sectors[i].length; j++)
            {
                if(sectors[i][j] !== null || j == sectors[i].length - 1)
                {
                    if(s != -1)
                    {
                        this.screens[s].column = { first: first + 1, end: j + 1 }
                    }
                    s = sectors[i][j];
                    first = j;
                }
            }
        }
    }
    appendScreen()
    {
        this.screens.push({
            tabs: [],
            set column(value) 
            { 
                this.gridColumn = value.first + " / " + value.end;
            },
            set rows(value) 
            { 
                this.gridRow = value.first + " / " + value.end;
            },
            gridColumn: "1 / 7",
            gridRow: "1 / 7",
            currentSoftware: -1
        });
    }
    drag = false;
    onDragStart(s, i)
    {
        this.dragSettings.s = s;
        this.dragSettings.i = i;
        this.drag = true;
    }
    onDragEnd()
    {
        this.dragSettings.s = -1;
        this.dragSettings.i = -1;
        this.drag = false;
    }
    appendTab(tab)
    {
        this.screens[this.currentScreen].tabs.push(tab);
    }
}