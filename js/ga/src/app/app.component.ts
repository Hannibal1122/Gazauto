import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { QueryService } from "./lib/query.service";
import { FunctionsService } from "./lib/functions.service";
import { TableEditorComponent } from './software/table-editor/table-editor.component';
import { InfoComponent } from './software/info/info.component';
import { TasksComponent } from './software/tasks/tasks.component';
import { TaskComponent } from './software/task/task.component';

declare var trace:any;
declare var $: any;
/* declare var TestData:any; */

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [QueryService, FunctionsService]
})
export class AppComponent implements OnInit
{
    @ViewChild('MyLeftMenu') public MyLeftMenu: ElementRef;
    @ViewChild('MyLeftObjects') public MyLeftObjects: ElementRef;
    timeSend = 900000;
    firstEnterBool = false;
    enter = false;
    load = false;
    leftMenuData = [];
    tabs = [];
    Login = "";
    
    currentSoftware = 0;
    hideSoftware = false;
    constructor(private query: QueryService, private lib: FunctionsService) { }
    leftMenuScroll = 
    {
        height: "0px",
        top: "0px"
    }
    ngOnInit(): void 
    {
        this.autoLogin(() => 
        { 
            this.enter = true; 
            this.Login = localStorage.getItem("login");
            this.refreshLeftMenu();
            /* this.openSoftware("explorer", { id: 0 }); */
            /* this.openSoftware("info", { id: -1 }); */
            /* this.openSoftware("task", { id: -1 }); */
            /* this.openSoftware("tasks", { id: -1 }); */
            this.openSoftware("table", { id: 66 });
            /* this.openSoftware("table", { id: 102 }); */
        });
        this.firstEnter(this);
        ////////////////////////////////////////////////////////////////////
        var onWheel = (e) => 
        {
            var elem = this.MyLeftObjects.nativeElement;
            var height = document.documentElement.clientHeight;
            var height2 = elem.clientHeight - height;
            e = e || window.event;
            var delta = e.deltaY || e.detail || e.wheelDelta;
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            var y = Number(elem.style.top.replace("px", ""));
            delta = y - delta / 2;
            if(delta >= 0 || height2 < 0) elem.style.top = "0px";
            else 
                if(delta <= -height2) elem.style.top = -height2 + "px";
                else elem.style.top = delta + "px";
            y = Number(elem.style.top.replace("px", ""));
            this.leftMenuScroll.top = Math.abs(Math.floor(y * height / elem.clientHeight)) + "px";
        }
        var elem = this.MyLeftMenu.nativeElement;
        elem.addEventListener("mousewheel", onWheel);
        window.addEventListener("resize", () => { this.leftMenuOnResize() }, false);
        
        ////////////////////////////////////////////////////////////////////
        document.addEventListener("dragenter", (e:any) => 
        {
            let id = e.target.getAttribute("id");
            if(id && id.split("_").length == 2 && e.target.tagName != "TH")
                e.target.style.background = "#aeec6c";//2px dotted 
        });
        document.addEventListener("dragleave", (e:any) => 
        {
            let id = e.target.getAttribute("id");
            if(id && id.split("_").length == 2 && e.target.tagName != "TH") e.target.style.background = "none";
        });
        document.addEventListener("drop", (e:any) => 
        {
            let id = e.target.getAttribute("id");
            id = id ? id.split("_") : [];
            if(id.length == 2) 
            {
                if(e.target.tagName != "TH") e.target.style.background = "none";
                let data = JSON.parse(localStorage.getItem("dragElement"));
                localStorage.removeItem("dragElement");
                this.tabs[this.currentSoftware].software.appendFromLeftMenu(Number(id[0]), Number(id[1]), data, e.target.tagName == "TH" ? id[1] : null);
            }
        });
        ////////////////////////////////////////////////////////////////////
    }
    leftMenuOnResize()
    {
        var elem = this.MyLeftObjects.nativeElement;
        var height = document.documentElement.clientHeight; // высота документа
        var height2 = elem.clientHeight;
        let y = Number(elem.style.top.replace("px", ""));
        var viewHeight = elem.clientHeight + y; // видимая высота

        if(height >= height2) elem.style.top = "0px";
        else
        {
            if(height >= viewHeight)
                elem.style.top = (y + height - viewHeight) + "px";
        }
        if(height < height2)
            this.leftMenuScroll.height = Math.floor(height * height / height2) + "px";
        else this.leftMenuScroll.height = "0px";
        y = Number(elem.style.top.replace("px", ""));
        this.leftMenuScroll.top = Math.abs(Math.floor(y * height / elem.clientHeight)) + "px";
    }
    openTab(i) // Активировать вкладку
    {
        this.currentSoftware = i;
    }
    closeTab(i) // Закрыть вкладку
    {
        this.tabs.splice(i, 1);
        if(i < this.currentSoftware) this.currentSoftware--;
        else if(i == this.currentSoftware)
        {
            if(this.tabs[i]) this.currentSoftware = i;
            else if(this.tabs[i - 1]) this.currentSoftware = i - 1;
        }
    }
    refreshLeftMenu() // обновить левое меню
    {
        this.query.protectionPost(353, { }, (data) =>
        {
            this.lastUpdateTime = data[0][0];
            this.getLastUpdateTime();
        });
        this.query.protectionPost(113, { param: [] }, (data) => 
        { 
            this.leftMenuData = data; 
            setTimeout(() => { this.leftMenuOnResize(); }, 20); 
        });
    }
    private lastUpdateTimer = null;
    private lastUpdateTime = "";
    private getLastUpdateTime() // Запрос изменений таблицы
    {
        clearTimeout(this.lastUpdateTimer);
        this.query.protectionPost(354, { param: [ this.lastUpdateTime ] }, (data) => 
        { 
            this.lastUpdateTime = data[1];
            if(data[0]) this.refreshLeftMenu();
            else this.lastUpdateTimer = setTimeout(() => { this.getLastUpdateTime(); }, 10000);
        });
    }
    onChangeInLeftMenu(e) // События из левого меню
    {
        switch(e.type)
        {
            case "open":
                this.openSoftware(e.value.name, e.value);
                break;
            case "height": setTimeout(() => { this.leftMenuOnResize(); }, 20); break;
        }
    }
    onChangeInSoftware(e) // Происходит из других приложений
    {
        switch(e.type)
        {
            case "open":
                this.openSoftware(e.value.name, e.value);
                break;
            case "openFromTable":
                this.query.protectionPost(111, { param: [ e.value.name, e.value.id ]}, (idParent) =>
                {
                    switch(e.value.name)
                    {
                        case "table":
                        case "file":
                        case "value":
                            this.openSoftware("explorer", { id: idParent[0][0], searchObjectId: e.value.name == "value" ? idParent[0][1] : e.value.id });
                            break;
                        case "cell":
                            this.openSoftware("table", { id: idParent[0][0], searchObjectId: e.value.id });
                            break;
                    }
                });
                break;
            case "updateTable":
                let i = 0;
                for(; i < this.tabs.length; i++)
                    if(this.tabs[i].type == "table" && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == e.id)
                    {
                        this.tabs[i].inputFromApp = { update: true };
                        break;
                    }
                break;
        }
    }
    openSoftware(type, input) // Открыть приложение
    {
        var i = 0;
        switch(type)
        {
            case "explorer": i = this.checkRepeatSoftware(type, { component: ExplorerComponent, inputs: input }); break;
            case "table": i = this.checkRepeatSoftware(type, { component: TableEditorComponent, inputs: input, appendFromLeftMenu: {} }); break;
            case "info": i = this.checkRepeatSoftware(type, { component: InfoComponent, inputs: input }); break;
            case "tasks": i = this.checkRepeatSoftware(type, { component: TasksComponent, inputs: input }); break;
            case "task": i = this.checkRepeatSoftware(type, { component: TaskComponent, inputs: input }); break;
        }
        this.currentSoftware = i;
    }
    checkRepeatSoftware(type, software)
    {
        var i = 0;
        var input = software.inputs;
        var name = "";
        switch(type)
        {
            case "explorer": name = "Проводник"; break;
            case "table": name = "Редактор таблицы"; break;
            case "info": name = "Справка"; break;
            case "tasks": name = "Задачник"; break;
            case "task": name = "Задача"; break;
        }
        for(; i < this.tabs.length; i++) // Проверка на уже открытую вкладку
            if(this.tabs[i].type == type && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == input.id) break;
        if(i != this.tabs.length) 
        {
            if(input.searchObjectId) 
                this.tabs[i].inputFromApp = { search: input.searchObjectId };
        }
        else
            this.tabs[i] = 
            {
                name: name,
                type: type,
                software: software,
                inputFromApp: null,
            };
        return i;
    }
    hideMenuSoftware() // скрыть из левого меню приложения
    {
        this.hideSoftware = !this.hideSoftware;
        setTimeout(() => { this.leftMenuOnResize(); }, 20); 
    }
    /*******************************************************************/
    autoLogin(func) // Автовход
    {
        this.load = true;
        this.query.protectionPost(6, {}, (data) =>
        {
            if(data[0] == -1)
            {
                this.query.post(7, { paramI: localStorage.getItem("ID") }, (data) => { });
                localStorage.setItem("checkKey", "");
                localStorage.setItem("login", "");
                localStorage.setItem("name", "");
                this.enter = false;
            }
            else func(data[0]);
            this.load = false;
        });
    }
    firstEnter(self) // Первый запуск и проверка на наличие ключа
    {
        if(localStorage.getItem("ID") === null)
            localStorage.setItem("ID", self.lib.getUnicName("G"));
        if(localStorage.getItem("timeSend") === null || Number(localStorage.getItem("timeSend")) < self.lib.getTimer() || !self.firstEnterBool)
        {
            self.query.post(1, { paramI: localStorage.getItem("ID") }, (data) =>
            {
                if(data.length == 0)
                    self.query.post(2, {param: [localStorage.getItem("ID"), '', '']}, function(data)
                    {
                    });
                else
                    self.query.post(3, {param: [localStorage.getItem("ID")]}, function(data)
                    {
                    });
            });	
            localStorage.setItem("timeSend", self.lib.getTimer() + self.timeSend);
            self.firstEnterBool = true;
        }
        setTimeout(() => { self.firstEnter(self) }, self.timeSend);
    }
    exitLogin() // Выход пользователя
    {
        this.query.post(7, { paramI: localStorage.getItem("ID") }, (data) => 
        { 
            location.reload();
        });
        localStorage.setItem("checkKey", "");
        localStorage.setItem("login", "");
        localStorage.setItem("name", "");
    }
    hideMenu = false;
    hideLeftMenu()
    {
        this.hideMenu = !this.hideMenu;
    }
}