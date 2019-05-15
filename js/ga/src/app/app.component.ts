import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { QueryService } from "./lib/query.service";
import { GlobalEvent } from "./system/global-event.service";
import { SplitScreen } from "./system/screen.service";
import { FunctionsService } from "./lib/functions.service";
import { TableEditorComponent } from './software/table-editor/table-editor.component';
import { EventEditorComponent } from './software/event-editor/event-editor.component';
import { PlanEditorComponent } from './software/plan-editor/plan-editor.component';
import { InfoComponent } from './software/info/info.component';
import { environment } from '../environments/environment';

declare var trace:any;
declare var $: any;
/* declare var TestData:any; */

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css', './app.screen.component.css'],
    providers: [ QueryService, FunctionsService, GlobalEvent ]
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
    _currentSoftware = 0;
    set currentSoftware(value)
    {
        this._currentSoftware = value;
    }
    get currentSoftware()
    {
        return this._currentSoftware;
    }
    splitScreen: SplitScreen = new SplitScreen();
    constructor(private query: QueryService, private lib: FunctionsService, private globalEvent:GlobalEvent) 
    { 
        query.post(0, {}, (data) => { this.Version = data.main });
        if(location.search == "?set_type=install")
            $.post(environment.URL, {nquery: -1}, (data)=>{ console.log(data) });
        globalEvent.subscribe("structure", -1, () => { this.refreshLeftMenu(); });

        /*************************************************/
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        window.addEventListener('resize', () => {
            // We execute the same script as before
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
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
            this.getSaveTabs();

            /* let currentTab = localStorage.getItem("CurrentTab");
            if(currentTab !== null) this.currentSoftware = Number(currentTab); */

            let miniApp:any = localStorage.getItem("MiniApp");
            if(miniApp !== null)
            {
                miniApp = JSON.parse(miniApp);
                this.hideMenu = miniApp.hide;
                this.currentMiniApp = miniApp.current;
            }
        });
        this.firstEnter();
        this.resizeWindow();
        window.addEventListener("resize", () => { this.resizeWindow() });
        ////////////////////////////////////////////////////////////////////
    }
    resizeWindow()
    {
        let Width = document.documentElement.clientWidth;
        if(Width < 380) this.panelApp.width = Width - 50;
        else this.panelApp.width = 320;
        if(Width < 720) this.panelApp.up = true;
        else this.panelApp.up = false;
    }
    openTab(s, i) // Активировать вкладку
    {
        let screen = this.splitScreen.screens[s];
        screen.currentSoftware = i;
        this.splitScreen.currentScreen = s;
        this.splitScreen.saveTabs();
    }
    closeTab(s, i) // Закрыть вкладку
    {
        let tab = this.splitScreen.screens[s].tabs[i];
        let _i = tab.i;
        this.removeSaveTab(_i);
        if(tab.type == "table")
            this.globalEvent.unsubscribe("table", tab.software.inputs.id);
        this.tabs.splice(_i, 1);
        this.splitScreen.closeTab(s, i);
    }
    leftMenuConfig = [];
    refreshLeftMenu() // обновить левое меню
    {
        this.query.protectionPost(113, { param: [] }, (data) => 
        { 
            if(!Array.isArray(data)) return;
            this.leftMenuConfig = [];
            if(data.length < this.leftMenuData.length) this.leftMenuData.splice(data.length - 1, this.leftMenuData.length);
            for(var i = 0; i < data.length; i++)
            {
                this.leftMenuConfig[i] = {
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
    onChangeInLeftMenu(e) // События из левого меню
    {
        switch(e.type)
        {
            case "open":
                this.openSoftware(e.value.name, { id: e.value.id });
                break;
            case "info":
                /* if(this.tabs[this.currentSoftware] && this.tabs[this.currentSoftware].type == "info")
                    this.tabs[this.currentSoftware].inputFromApp = e.value.id; */
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
            case "updateTableIds":
                this.globalEvent.appendTableIds(e.id, e.tableIds, e.idLogTableOpen);
                break;
        }
    }
    openSoftware(type, input, settings?) // Открыть приложение
    {
        var i = 0;
        switch(type)
        {
            case "explorer": i = this.getNewTab(type, { component: ExplorerComponent, inputs: input }, settings); break;
            case "table": 
                i = this.getNewTab(type, { component: TableEditorComponent, inputs: input }, settings);
                let tableId = input.id;
                this.globalEvent.subscribe("table", tableId, (event) =>
                {
                    let i = this.checkRepeatSoftware(type, tableId);
                    if(event.update) this.tabs[i].inputFromApp = { update: true, logins: event.logins };
                    else this.tabs[i].inputFromApp = { logins: event.logins };
                });
                break;
            case "info": i = this.getNewTab(type, { component: InfoComponent, inputs: input }, settings); break;
            case "event": i = this.getNewTab(type, { component: EventEditorComponent, inputs: input }, settings); break;
            case "plan": i = this.getNewTab(type, { component: PlanEditorComponent, inputs: input }, settings); break;
        }
    }
    getNewTab(type, software, settings)
    {
        var input = software.inputs;
        var name = "";
        switch(type)
        {
            case "explorer": name = "Проводник"; break;
            case "table": name = "Редактор таблицы"; break;
            case "info": name = "Справка"; break;
            case "event": name = "Редактор событий"; break;
            case "plan": name = "План-график"; break;
        }
        let i = this.checkRepeatSoftware(type, input.id);
        if(i != this.tabs.length) 
        {
            if(input.searchObjectId) this.tabs[i].inputFromApp = { search: input.searchObjectId };
            if(input.element) this.tabs[i].inputFromApp = { element: input.element };
            this.splitScreen.setActiveTab(i);
        }
        else
        {
            this.tabs[i] = {
                name: name,
                type: type,
                software: software,
                inputFromApp: null,
                i: i
            };
            this.splitScreen.appendTab(this.tabs[i], settings);
        }
        this.tabs[i].software.inputs.updateHistory = () => { this.splitScreen.saveTabs(); } 
        return i;
    }
    checkRepeatSoftware(type, id)
    {
        let i = 0;
        for(; i < this.tabs.length; i++) // Проверка на уже открытую вкладку
            if(this.tabs[i].type == type && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == id) break;
        return i;
    }
    /*******************************************************************/
    autoLogin(func) // Автовход
    {
        this.load = true;
        this.query.protectionPost(6, {}, (data) =>
        {
            if(typeof data !== "object") return;
            if(data[0] == -1)
            {
                this.query.post(7, { paramI: localStorage.getItem("ID") });
                localStorage.setItem("checkKey", "");
                localStorage.setItem("login", "");
                localStorage.setItem("name", "");
                this.enter = false;
            }
            else func(data[0]);
            this.load = false;
        });
    }
    firstEnter() // Первый запуск и проверка на наличие ключа
    {
        if(localStorage.getItem("ID") === null || localStorage.getItem("ID") == "")
            localStorage.setItem("ID", this.lib.getUnicName("G"));
        this.globalEvent.subscribe("online", null, () =>
        {
            this.query.post(1, { paramI: localStorage.getItem("ID") });	
        });
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
        localStorage.removeItem("Sectors");
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
        let saveTabs:any = localStorage.getItem("Tabs"); 
        if(saveTabs == null) saveTabs = [];
        else saveTabs = JSON.parse(saveTabs);
        let sectors = localStorage.getItem("Sectors");
        if(sectors != null) this.splitScreen.sectors = JSON.parse(sectors);

        this.splitScreen.appendScreenBySectors();
        for(var i = 0; i < saveTabs.length; i++) 
            if(saveTabs[i])
                this.openSoftware(saveTabs[i][0], saveTabs[i][1], { screen: saveTabs[i][2], current: saveTabs[i][3] });
    }
    removeSaveTab(i) // Удаление вкладки из сохранения
    {
        let saveData:any = localStorage.getItem("Tabs"); 
        saveData = JSON.parse(saveData);
        saveData.splice(i, 1);
        localStorage.setItem("Tabs", JSON.stringify(saveData));
    }
}