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
        this.appendScreen(0, 0, 0);
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
                this.sector = this.getNewSector();
                this.appendScreen(this.sector, pointA.i, pointA.j);
                this.setRectInSectors(pointA, pointB, this.sector);
                this.calcSectors();
            }
            else this.sector = this.sectors[pointA.i][pointA.j];

            let s = this.dragSettings.s; // Откуда
            let tabsI = this.dragSettings.tabsI;
            let tab = this.screens[s].tabs[tabsI];
            this.screens[this.sector].tabs.push(tab);
            this.screens[s].tabs.splice(tabsI, 1);
            this.screens[this.sector].currentSoftware = this.screens[this.sector].tabs.length - 1;
            if(this.screens[s].tabs.length == 0)
            {
                this.fillTheVoid(s);
                this.screens[s] = null;
            }
            this.calcSectors();
            this.onDragEnd();
        }, false);
    }
    getNewSector()
    {
        let i = 0;
        for(; i < this.screens.length; i++)
            if(this.screens[i] === null) return i;
        return i;
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
                if(screen === null) continue;
                if(!(screen.first.i == i && screen.first.j == j))
                {
                    this.screens[s].end = { i: i, j: j }
                    this.screens[s].column = { first: screen.first.j + 1, end: screen.end.j + 2 }
                    this.screens[s].rows = { first: screen.first.i + 1, end: screen.end.i + 2 }
                }
            }
        }
    }
    appendScreen(screenI, i, j)
    {
        this.screens[screenI] = {
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
            first: { i: i, j: j },
            end: { i: this.sectors.length, j: this.sectors[0].length }
        };
    }
    fillTheVoid(screenI)
    {
        let screenA = this.screens[screenI];
        let screenB;
        for(let i = 0; i < this.screens.length; i++)
        {
            if(i == screenI || this.screens[i] === null) continue;
            screenB = this.screens[i];
            if(screenA.first.i == screenB.first.i)
            {
                let right = screenB.end.j == screenA.first.j - 1;
                let left = screenB.first.j == screenA.end.j + 1;
                if(left || right)
                {
                    let aH = (screenA.end.i - screenA.first.i) + 1;
                    let bH = (screenB.end.i - screenB.first.i) + 1;
                    if(aH >= bH)
                    {
                        this.setRectInSectors(screenA.first, { i: screenB.end.i + 1, j: screenA.end.j + 1 }, i);
                        if(left) screenB.first.j = screenA.first.j;
                        if(right) screenB.end.j = screenA.end.j;
                        if(aH > bH)
                        {
                            screenA.first.i += bH;
                            this.fillTheVoid(screenI);
                        }
                        break;
                    }
                }
            }
            if(screenA.first.j == screenB.first.j)
            {
                let up = screenB.end.i === screenA.first.i - 1;
                let down = screenB.first.i === screenA.end.i + 1;
                if(up || down)
                {
                    let aW = (screenA.end.j - screenA.first.j) + 1;
                    let bW = (screenB.end.j - screenB.first.j) + 1;
                    if(aW >= bW)
                    {
                        this.setRectInSectors(screenA.first, { i: screenA.end.i + 1, j: screenB.end.j + 1 }, i);
                        if(down) screenB.first.i = screenA.first.i;
                        if(up) screenB.end.i = screenA.end.i;
                        if(aW > bW)
                        {
                            screenA.first.j += bW;
                            this.fillTheVoid(screenI);
                        }
                        break;
                    }
                }
            }
        }
    }
    setRectInSectors(pointA, pointB, value)
    {
        for(let i = pointA.i; i < pointB.i; i++)
            for(let j = pointA.j; j < pointB.j; j++)
                this.sectors[i][j] = value;
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
    closeTab(s, i)
    {
        let tabsI = i;
        this.screens[s].tabs.splice(tabsI, 1);
        if(this.screens[s].tabs.length == 0)
        {
            this.fillTheVoid(s);
            this.screens[s] = null;
        }
        this.calcSectors();
    }
}