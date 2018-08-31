import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { QueryService } from "./lib/query.service";
import { FunctionsService } from "./lib/functions.service";
import { TableEditorComponent } from './software/table-editor/table-editor.component';
import { EventEditorComponent } from './software/event-editor/event-editor.component';
import { InfoComponent } from './software/info/info.component';

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
    /* @ViewChild('MyLeftMenu') public MyLeftMenu: ElementRef;
    @ViewChild('MyLeftObjects') public MyLeftObjects: ElementRef; */
    timeSend = 900000;
    firstEnterBool = false;
    enter = false;
    load = false;
    leftMenuData = [];
    tabs = [];
    Login = "";
    Version = "";
    currentSoftware = 0;
    constructor(private query: QueryService, private lib: FunctionsService) 
    { 
        query.post(0, {}, (data) => { this.Version = data.main });
    }
    leftMenuScroll = 
    {
        height: "0px",
        top: "0px"
    }
    panelApp = 
    {
        up: false,
        width: 320
    }; // Если размер меньше 720 то меню будет поверх
    ngOnInit(): void 
    {
        this.autoLogin(() => 
        { 
            this.enter = true; 
            this.Login = localStorage.getItem("login");
            this.refreshLeftMenu();
            let saveTabs = this.getSaveTabs();
            for(var i = 0; i < saveTabs.length; i++) this.openSoftware(saveTabs[i][0], saveTabs[i][1]);

            let currentTab = localStorage.getItem("CurrentTab");
            if(currentTab !== null) this.currentSoftware = Number(currentTab);

            let miniApp:any = localStorage.getItem("MiniApp");
            if(miniApp !== null)
            {
                miniApp = JSON.parse(miniApp);
                this.hideMenu = miniApp.hide;
                this.currentMiniApp = miniApp.current;
            }
        });
        this.firstEnter(this);
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
        this.resizeWindow();
        window.addEventListener("resize", () => { this.resizeWindow() });
        ////////////////////////////////////////////////////////////////////
    }
    resizeWindow()
    {
        let Width = document.documentElement.clientWidth;
        if(Width < 380) this.panelApp.width = Width - 60;
        else this.panelApp.width = 320;
        if(Width < 720) this.panelApp.up = true;
        else this.panelApp.up = false;
    }
    openTab(i) // Активировать вкладку
    {
        this.currentSoftware = i;
        localStorage.setItem("CurrentTab", i);
    }
    closeTab(i) // Закрыть вкладку
    {
        this.removeSaveTab(i);
        this.tabs.splice(i, 1);
        if(i < this.currentSoftware) this.currentSoftware--;
        else if(i == this.currentSoftware)
        {
            if(this.tabs[i]) this.currentSoftware = i;
            else if(this.tabs[i - 1]) this.currentSoftware = i - 1;
        }
    }
    leftMenuConfig = [];
    refreshLeftMenu() // обновить левое меню
    {
        this.query.protectionPost(353, { }, (data) =>
        {
            if(data === "") return;
            this.lastUpdateTime = data[0][0];
            this.getLastUpdateTime();
        });
        this.query.protectionPost(113, { param: [] }, (data) => 
        { 
            if(data === "") return;
            this.leftMenuConfig = [];
            if(data.length < this.leftMenuData.length) this.leftMenuData.splice(data.length - 1, this.leftMenuData.length);
            for(var i = 0; i < data.length; i++)
            {
                this.leftMenuConfig[i] = 
                {
                    name: data[i].name,
                    id: data[i].id,
                    buttons: data[i].buttons,
                    filter: data[i].filter
                }
                if(this.leftMenuData[i] == undefined) this.leftMenuData[i] = {};
                for(var key in data[i]) this.leftMenuData[i][key] = data[i].childrens;
            }
        });
    }
    private lastUpdateTimer = null;
    private lastUpdateTime = "";
    private getLastUpdateTime() // Запрос изменений таблицы
    {
        clearTimeout(this.lastUpdateTimer);
        // 414 - события по времени
        this.query.protectionPost(414, { }, (data) =>  
        {
            this.query.protectionPost(354, { param: [ this.lastUpdateTime ] }, (data) => 
            { 
                if(data === "") return;
                this.lastUpdateTime = data[1];
                if(data[0]) this.refreshLeftMenu();
                else this.lastUpdateTimer = setTimeout(() => { this.getLastUpdateTime(); }, 10000);
            });
        });
    }
    onChangeInLeftMenu(e) // События из левого меню
    {
        switch(e.type)
        {
            case "open":
                this.openSoftware(e.value.name, e.value);
                break;
            case "info":
                if(this.tabs[this.currentSoftware].type == "info")
                    this.tabs[this.currentSoftware].inputFromApp = e.value.id;
                break;
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
                    if(idParent === "") return;
                    switch(e.value.name)
                    {
                        case "table":
                        case "file":
                        case "event":
                        case "tlist":
                        case "value":
                            this.openSoftware("explorer", { id: idParent[0][0], searchObjectId: e.value.name == "value" || e.value.name == "tlist" ? idParent[0][1] : e.value.id });
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
        let length = this.tabs.length;
        switch(type)
        {
            case "explorer": i = this.checkRepeatSoftware(type, { component: ExplorerComponent, inputs: input }); break;
            case "table": i = this.checkRepeatSoftware(type, { component: TableEditorComponent, inputs: input, appendFromLeftMenu: {} }); break;
            case "info": i = this.checkRepeatSoftware(type, { component: InfoComponent, inputs: input }); break;
            case "event": i = this.checkRepeatSoftware(type, { component: EventEditorComponent, inputs: input }); break;
        }
        if(length != this.tabs.length) this.setSaveTab(i, type, input) // Новая вкладка, нужно сохранить
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
            case "event": name = "Редактор событий"; break;
        }
        for(; i < this.tabs.length; i++) // Проверка на уже открытую вкладку
            if(this.tabs[i].type == type && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == input.id) break;
        if(i != this.tabs.length) 
        {
            if(input.searchObjectId) this.tabs[i].inputFromApp = { search: input.searchObjectId };
            if(input.element) this.tabs[i].inputFromApp = { element: input.element };
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
    /*******************************************************************/
    autoLogin(func) // Автовход
    {
        this.load = true;
        this.query.protectionPost(6, {}, (data) =>
        {
            if(data === "") return;
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
        localStorage.removeItem("MiniApp");
        localStorage.removeItem("Tabs");
        localStorage.removeItem("CurrentTab");
    }
    hideMenu = true;
    currentMiniApp = "";
    openMiniApp(name)
    {
        if(name != this.currentMiniApp)
            this.hideMenu = false;
        else this.hideMenu = !this.hideMenu;
        this.currentMiniApp = name;
        localStorage.setItem("MiniApp", JSON.stringify({ hide: this.hideMenu, current: name }));
    }
    getSaveTabs() // Запрос всех сохраненных вкладок
    {
        let saveData:any = localStorage.getItem("Tabs"); 
        if(saveData == null) return [];
        else return JSON.parse(saveData);
    }
    setSaveTab(i, type, input) // Сохранение вкладки
    {
        let saveData:any = localStorage.getItem("Tabs");
        if(saveData == null) saveData = [];
        else saveData = JSON.parse(saveData);
        saveData[i] = [type, { id: input.id }];
        localStorage.setItem("Tabs", JSON.stringify(saveData));
    }
    removeSaveTab(i) // Удаление вкладки из сохранения
    {
        let saveData:any = localStorage.getItem("Tabs"); 
        saveData = JSON.parse(saveData);
        saveData.splice(i, 1);
        localStorage.setItem("Tabs", JSON.stringify(saveData));
    }
}
/* $.post('http://localhost:8081/gazprom/scripts/main.php', {nquery: -1}, (data)=>{console.log(data)}); */