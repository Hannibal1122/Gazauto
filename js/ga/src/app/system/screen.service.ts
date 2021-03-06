import { Injectable } from '@angular/core';
import { QueryService } from '../lib/query.service'
import { QueueService } from '../software/table-editor-v2/queue.service'
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
    empty = true;
    queue:QueueService;
    constructor(private query: QueryService)
    {
        this.queue = new QueueService(query);
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

            event.preventDefault();
            event.dataTransfer.dropEffect = "move"
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

            if(s !== this.sector)
            {
                let tabsI = this.dragSettings.tabsI;
                if(tabsI == -1) return;
                let tab = this.screens[s].tabs[tabsI];
                this.screens[this.sector].tabs.push(tab);
                this.screens[s].tabs.splice(tabsI, 1);
                this.screens[this.sector].currentSoftware = this.screens[this.sector].tabs.length - 1;
                if(this.screens[s].tabs.length == 0)
                {
                    this.fillTheVoid(s);
                    this.screens[s] = null;
                }
                else this.screens[s].currentSoftware = this.screens[s].tabs.length - 1;
                this.currentScreen = this.sector;
                this.calcSectors();
            }
            this.onDragEnd();
            this.saveTabs();
        }, false);
    }
    getNewSector() // Массив screens может содержать null или undefined 
    {
        let i = 0;
        for(; i < this.screens.length; i++)
            if(!this.screens[i]) return i;
        return i;
    }
    getRect(pointA) // Вычисляет область сектора по первой точке
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
    calcSectors() // Вычисляется grid-column и grid-row для grid
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
                if(!screen) continue;
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
        this.currentScreen = screenI;
    }
    appendScreenBySectors()
    {
        this.screens = [];
        for(let i = 0; i < this.sectors.length; i++)
            for(let j = 0; j < this.sectors[i].length; j++)
            {
                let s = this.sectors[i][j];
                if(!this.screens[s]) this.appendScreen(s, i, j);
            }
        this.calcSectors();
    }
    fillTheVoid(screenI)
    {
        let screenA = this.screens[screenI];
        let screenB;
        for(let i = 0; i < this.screens.length; i++)
        {
            if(i == screenI || !this.screens[i]) continue;
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
    onDragStart(event, s, tabsI)
    {
        event.dataTransfer.effectAllowed = "move";
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
    appendTab(tab, settings?)
    {
        if(settings === undefined)
        {
            let s = this.getLastScreen();
            this.screens[s].tabs.push(tab);
            this.screens[s].currentSoftware = this.screens[s].tabs.length - 1;
        }
        else 
        {
            if(settings.screen === undefined) settings.screen = this.getLastScreen();
            this.screens[settings.screen].tabs.push(tab);
            if(settings.current) this.screens[settings.screen].currentSoftware = this.screens[settings.screen].tabs.length - 1;
        }
        this.saveTabs();
        this.empty = false;
    }
    getGUID() // Каждый элемент получает уникальный идетификатор
    {
        let S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    setActiveTab(guid) // Делает активной вкладку по tabsI
    {
        for(let s = 0; s < this.screens.length; s++)
            if(this.screens[s])
                for(let j = 0; j < this.screens[s].tabs.length; j++)
                    if(this.screens[s].tabs[j].guid == guid)
                    {
                        this.screens[s].currentSoftware = j;
                        break;
                    }
    }
    getLength() // Получить длину массива
    {
        let l = 0;
        for(let i = 0; i < this.screens.length; i++)
            if(this.screens[i]) l++;
        return l;
    }
    getLastScreen()
    {
        let i = 0;
        if(this.screens[this.currentScreen]) return this.currentScreen;
        for(; i < this.screens.length; i++)
            if(this.screens[i]) return i;
        return i;
    }
    closeTab(s, i)
    {
        let tabsI = i;
        let screen = this.screens[s];
        let tabs = screen.tabs;
        tabs.splice(tabsI, 1);
        if(tabs.length == 0)
        {
            this.fillTheVoid(s);
            if(this.getLength() > 1) this.screens[s] = null;
            else this.empty = true; 
            this.currentScreen = this.getLastScreen();
        }
        else
        {
            if(i < screen.currentSoftware) screen.currentSoftware--;
            else if(i == screen.currentSoftware)
            {
                if(tabs[i]) screen.currentSoftware = i;
                else if(tabs[i - 1]) screen.currentSoftware = i - 1;
            }
        }
        this.calcSectors();
        this.saveTabs();
    }
    closeAllTabs()
    {
        this.screens = [];
        this.sectors = 
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        this.empty = true;
        this.currentScreen = 0;
        this.appendScreen(0, 0, 0);
        this.calcSectors();
    }
    saveTabs()
    {
        let saveData = []
        for(let s = 0; s < this.screens.length; s++)
            if(this.screens[s])
                for(let j = 0; j < this.screens[s].tabs.length; j++)
                {
                    let tab = this.screens[s].tabs[j];
                    saveData.push([tab.type, { id: tab.software.inputs.id }, s, this.screens[s].currentSoftware == j])
                }

        this.queue.add(450, [ "user_tabs", JSON.stringify(saveData) ]);
        this.queue.add(450, [ "user_sectors", JSON.stringify(this.sectors) ]);
    }
}