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
        tabsI: -1,
        new: false,
        rect: {
            pointA: { i: 0, j: 0},
            pointB: { i: 0, j: 0}
        }
    };
    sectors = 
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
    constructor()
    {
        this.appendScreen(0, 0);
        document.addEventListener("dragover", (event:any) => 
        {
            if(event.target.className != "DragScreen") return;
            let box = event.target.getBoundingClientRect();
            let mouseX = event.clientX - box.x;
            let mouseY = event.clientY - box.y;

            let w = box.width / 4;
            let h = box.height / 4;
            let pointA = 
            {
                i: Math.floor(mouseY / h),
                j:  Math.floor(mouseX / w)
            }
            let first = this.screens[this.sectors[pointA.i][pointA.j]].first;
            pointA.j = first.i == pointA.i ? pointA.j : first.j;
            let pointB = this.getRect(pointA);
            this.rect.left = pointA.j * w + "px";
            this.rect.top = pointA.i * h + "px";
            this.rect.width = (pointB.j - pointA.j) * w + "px";
            this.rect.height = (pointB.i - pointA.i) * h + "px";

            this.dragSettings.new = !(first.i == pointA.i && first.j == pointA.j);
            this.dragSettings.rect.pointA = pointA;
            this.dragSettings.rect.pointB = pointB;
        }, false);
        document.addEventListener("dragend", (event:any) => 
        {
            let pointA = this.dragSettings.rect.pointA;
            let pointB = this.dragSettings.rect.pointB;
            if(this.dragSettings.new)
            {
                this.sector = this.screens.length;
                this.appendScreen(pointA.i, pointA.j);
                for(let i = pointA.i; i < pointB.i; i++)
                    for(let j = pointA.j; j < pointB.j; j++)
                        this.sectors[i][j] = this.sector;
            }
            else this.sector = this.sectors[pointA.i][pointA.j];

            let s = this.dragSettings.s;
            let tabsI = this.dragSettings.tabsI;
            let tab = this.screens[s].tabs[tabsI];
            this.screens[this.sector].tabs.push(tab);
            this.screens[s].tabs.splice(tabsI, 1);
            this.screens[this.sector].currentSoftware = this.screens[this.sector].tabs.length - 1;
            /* if(this.screens[s].tabs.length == 0)
            {
                this.sectors[this.screens[s].y][this.screens[s].x] = null;
                this.screens[s] = null;
            } */
            this.calcSectors();
            this.onDragEnd();
            trace(this.screens)
            trace(this.sectors)
        }, false);
    }
    getRect(pointA)
    {
        let sectors = this.sectors;
        let s = sectors[pointA.i][pointA.j]; // Текущий сектор
        let pointB = { i: 0, j: 0};
        let i = pointA.i + 1;
        for(; i < sectors.length; i++)
            if(sectors[i][pointA.j] != s) break;
        pointB.i = i;
        let j = pointA.j + 1;
        for(; j < sectors[pointA.i].length; j++)
            if(sectors[pointA.i][j] != s) break;
        pointB.j = j;
        return pointB;
    }
    calcSectors()
    {
        let sectors = this.sectors;
        for(let i = 0; i < sectors.length; i++)
        {
            let s = -1;
            let screen;
            let l = sectors[i].length;
            for(let j = 0; j < l; j++)
            {
                s = sectors[i][j];
                screen = this.screens[s];
                if(!(screen.first.i == i && screen.first.j == j))
                {
                    this.screens[s].column = { first: screen.first.j + 1, end: j + 2 }
                    this.screens[s].rows = { first: screen.first.i + 1, end: i + 2 }
                }
            }
        }
    }
    appendScreen(i, j)
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
            currentSoftware: -1,
            first: { i: i, j: j}
        });
    }
    drag = false;
    onDragStart(s, tabsI)
    {
        this.dragSettings.s = s; // Из какого экрана
        this.dragSettings.tabsI = tabsI; // Номер влкадки
        this.drag = true;
    }
    onDragEnd()
    {
        this.dragSettings.s = -1;
        this.dragSettings.tabsI = -1;
        this.drag = false;
    }
    appendTab(tab)
    {
        this.screens[this.currentScreen].tabs.push(tab);
    }
}