import { Component, OnInit, ViewChild, ElementRef, ApplicationRef } from '@angular/core';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { QueryService } from "./lib/query.service";
import { GlobalEvent } from "./system/global-event.service";
import { SplitScreen } from "./system/screen.service";
import { FunctionsService } from "./lib/functions.service";
import { EventEditorComponent } from './software/event-editor/event-editor.component';
import { PlanEditorComponent } from './software/plan-editor/plan-editor.component';
import { EventLogComponent } from './software/event-log/event-log.component';
import { TemplateConstructorComponent } from './software/template-constructor/template-constructor.component'
import { StatisticsEditorComponent } from './software/statistics-editor/statistics-editor.component'

import { InfoComponent } from './software/info/info.component';
import { environment } from '../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

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
    @ViewChild('modal') public modal: any;
    enter = false;
    loaded = false;
    leftMenuData = [];
    tabs = [];
    Login = "";
    Version = "";
    _currentSoftware = 0;
    globalEvent:GlobalEvent;
    windowType = "interface";
    stickers = [];
    favorites = [];
    set currentSoftware(value)
    {
        this._currentSoftware = value;
    }
    get currentSoftware()
    {
        return this._currentSoftware;
    }
    theme = 
    {
        set current(value)
        {
            if(value.type == "image") this.style["background-image"] = 'url(assets/img/theme/' + value.name + ')';
            else
            if(value.type == "color")
            {
                this.style["background-image"] = "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))";
                this.style["background-color"] = value.name;
            }
            else this.style = {};
        },
        style: {}
    }
    splitScreen: SplitScreen = new SplitScreen(this.query);
    constructor(private query: QueryService, 
        private lib: FunctionsService, 
        protected sanitizer: DomSanitizer, 
        private ref: ApplicationRef
    ) 
    { 
        let lParam:any = this.query.getValueBySrc(location.search);
        switch(lParam.mode)
        {
            case undefined:
                query.post(0, {}, (data) => { this.Version = data.main });
                if(location.search == "?set_type=install")
                    $.post(environment.URL, {nquery: -1}, (data)=>{ console.log(data) });
                this.globalEvent = new GlobalEvent(query);
                this.globalEvent.subscribe("structure", -1, () => { this.refreshLeftMenu(); });
                this.globalEvent.subscribe("iframe", -1, () => 
                { 
                    let i = 0;
                    while(i < 1000)
                    {
                        if(!localStorage.getItem("propertyIFrame_" + i)) break;
                        let data = JSON.parse(localStorage.getItem("propertyIFrame_" + i));
                        this.onChangeInSoftware(data);
                        localStorage.removeItem("propertyIFrame_" + i);
                        i++;
                    }
                });
                break;
            case "table":
                this.windowType = "table";
                break;
            /* case "/constructor":
                this.windowType = "constructor";
                break; */
        }
        /*************************************************/
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        window.addEventListener('resize', () => {
            // We execute the same script as before
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });

        ///////////////////////УСТАНОВКА ТЕМЫ/////////////////////
        this.query.protectionPost(451, { param: ["theme"] }, (data) =>
        {
            if(data != "") this.theme.current = data;
            if(data.theme) this.applyTheme(data.theme);
        });
        this.applyTheme("blue");
    }
    applyTheme(value)
    {
        let mainThemeCss = document.getElementById("MainThemeCSS");
        if(!mainThemeCss)
        {
            mainThemeCss = document.createElement("link");
            mainThemeCss.setAttribute("id", "MainThemeCSS");
            mainThemeCss.setAttribute("rel", "stylesheet");
            document.getElementsByTagName('head')[0].appendChild(mainThemeCss);
        }
        mainThemeCss.setAttribute("href", "assets/css/main-theme-" + value + ".css");
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
        if(this.windowType == "interface")
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
        }
    }
    resizeWindow()
    {
        let Width = document.documentElement.clientWidth;
        if(Width < 380) this.panelApp.width = Width - 50;
        else this.panelApp.width = 320;
        if(Width < 720) this.panelApp.up = true;
        else this.panelApp.up = false;
    }
    setFavorite(tab)
    {
        let inputs = tab.software.inputs;
        if(this.favorites[inputs.id]) delete this.favorites[inputs.id];
        else this.favorites[inputs.id] = tab.type;
        this.query.protectionPost(450, { param: [ "user_favorites", JSON.stringify(this.favorites) ] });
    }
    openTab(s, i) // Активировать вкладку
    {
        let screen = this.splitScreen.screens[s];
        screen.currentSoftware = i;
        this.splitScreen.currentScreen = s;
        this.setCurrentStickers();
        this.splitScreen.saveTabs();
    }
    closeTab(s, i) // Закрыть вкладку
    {
        let tab = this.splitScreen.screens[s].tabs[i];
        let guid = tab.guid;
        if(tab.type == "table")
            this.globalEvent.unsubscribe("table", tab.software.inputs.id);
        let _i = 0;
        for(; _i < this.tabs.length; _i++)
            if(this.tabs[_i].guid == guid) break;
        this.tabs.splice(_i, 1);
        this.splitScreen.closeTab(s, i);
        /* this.removeSaveTab(_i); */
        this.setCurrentStickers();
    }
    closeAllTabs()
    {
        let i = 0;
        for(; i < this.tabs.length; i++)
            if(this.tabs[i].type == "table")
                this.globalEvent.unsubscribe("table", this.tabs[i].software.inputs.id);
        this.tabs = [];
        this.splitScreen.closeAllTabs();
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
            case "openFromTable":
                this.onChangeInSoftware(e);
                break;
            case "info":
                let screen = this.splitScreen.screens[this.splitScreen.currentScreen];
                let currentSoftware = screen.tabs[screen.currentSoftware];
                if(currentSoftware && currentSoftware.type == "info")
                    currentSoftware.inputFromApp = e.value.id;
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
                if(e.value.type === "open")
                    this.openSoftware(e.value.name, { id: e.value.id });
                else 
                {
                    this.query.protectionPost(111, { param: [ e.value.name, e.value.id ]}, (parent) =>
                    {
                        if(parent === null) return;
                        switch(e.value.name)
                        {
                            case "table":
                            case "file":
                            case "event":
                            case "tlist":
                            case "script":
                            case "plan":
                            case "class":
                            case "folder":
                            case "filter":
                            case "label":
                                this.openSoftware("explorer", { id: parent.parent, searchObjectId: e.value.name == "tlist" ? parent.id : e.value.id });
                                break;
                            case "cell":
                                this.openSoftware("table", { id: parent.tableId, searchObjectId: e.value.id });
                                break;
                        }
                    });
                }
                break;
            case "updateTable":
                for(let i = 0; i < this.tabs.length; i++)
                    if(this.tabs[i].type == "table" && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == e.id)
                    {
                        this.tabs[i].inputFromApp = { update: true };
                        break;
                    }
                break;
            case "updateTableIds":
                this.globalEvent.appendTableIds(e.id, e.tableIds, e.idLogTableOpen);
                break;
            case "changeTheme": // смена темы
                this.theme.current = e.value;
                if(e.value.theme) this.applyTheme(e.value.theme);
                break;
            case "updateStickers": // В эксплорере открыли папку с заметками
                for(let i = 0; i < this.tabs.length; i++)
                    if(this.tabs[i].type == e.software && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == e.id)
                    {
                        if(e.name) this.tabs[i].name = e.name;
                        this.tabs[i].stickers = e.value;
                    }
                this.setCurrentStickers();
                break;
            case "openFavorites":
                this.modal.open({ title: "Это приведет к закрытию текущих вкладок!", data: [], ok: "Ок", cancel: "Отмена"}, (save) =>
                {
                    if(save)
                    {
                        this.closeAllTabs();
                        this.query.protectionPost(451, { param: ["user_favorites"] }, (favorites) =>
                        {
                            this.favorites = favorites || {};
                            for(var key in this.favorites) 
                                this.openSoftware(this.favorites[key], { id: Number(key) });
                        });
                    }
                })
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
                i = this.getNewTab(type, { inputs: input }, settings);
                let tableId = input.id;
                this.globalEvent.subscribe("table", tableId, (event) =>
                {
                    let i = this.checkRepeatSoftware(type, tableId);
                    if(this.tabs[i] && this.tabs[i].useIframe)
                    {
                        let iframe = this.tabs[i].iframe;
                        if(iframe === null) return;
                        if(event.update) iframe.inputFromApp = { update: true, logins: event.logins };
                        else iframe.inputFromApp = { logins: event.logins };
                        iframe.dispatchEvent(iframe.EventUpdateFromApp);
                    }
                });
                break;
            case "class": i = this.getNewTab(type, { component: TemplateConstructorComponent, inputs: input }, settings); break;
            case "info": i = this.getNewTab(type, { component: InfoComponent, inputs: input }, settings); break;
            case "event": i = this.getNewTab(type, { component: EventEditorComponent, inputs: input }, settings); break;
            case "plan": i = this.getNewTab(type, { component: PlanEditorComponent, inputs: input }, settings); break;
            case "log": i = this.getNewTab(type, { component: EventLogComponent, inputs: input }, settings); break;
            case "statistics": i = this.getNewTab(type, { component: StatisticsEditorComponent, inputs: input }, settings); break;
        }
    }
    getNewTab(type, software, settings)
    {
        var input = software.inputs;
        var name = "";
        let param;
        let _location = document.getElementsByTagName("base")[0].getAttribute("href");
        switch(type)
        {
            case "explorer": 
                name = input.type === "recycle" ? "Корзина" : "Проводник"; 
                break;
            case "table": 
                param = "id=" + input.id + "&mode=table";
                if(input.searchObjectId) param += "&searchObjectId=" + input.searchObjectId;
                software.securitySrc = this.sanitizer.bypassSecurityTrustResourceUrl(_location + "?" + param);
                name = "Редактор таблицы"; 
                break;
            case "class": name = "Конструктор шаблонов"; break;
            case "info": name = "Справка"; break;
            case "event": name = "Редактор событий"; break;
            case "plan": name = "План-график"; break;
            case "statistics": name = "Статистика"; break;
        }
        let i = this.checkRepeatSoftware(type, input.id);
        if(i != this.tabs.length) 
        {
            if(input.searchObjectId) this.tabs[i].inputFromApp = { search: input.searchObjectId };
            if(input.element) this.tabs[i].inputFromApp = { element: input.element };
            // Специально для iframe
            if(this.tabs[i].iframe && input.searchObjectId)
            {
                this.tabs[i].iframe.searchObjectId = input.searchObjectId;
                this.tabs[i].iframe.dispatchEvent(this.tabs[i].iframe.EventUpdateFromApp);
            }
            this.splitScreen.setActiveTab(this.tabs[i].guid);
        }
        else
        {
            let useIframe = false;
            if(type == "table") useIframe = true;
            this.tabs[i] = {
                name: name,
                type: type,
                software: software,
                inputFromApp: null,
                guid: this.splitScreen.getGUID(),
                loaded: !useIframe,
                iframe: null, 
                stickers: [],
                useIframe: useIframe // Открывать ли приложение через iframe
            };
            this.query.protectionPost(126, { param: [this.tabs[i].software.inputs.id] }, (data) =>
            {
                this.tabs[i].name = data || this.tabs[i].name;
            });
            this.splitScreen.appendTab(this.tabs[i], settings);
        }
        this.tabs[i].software.inputs.updateHistory = () => { this.splitScreen.saveTabs(); } 
        return i;
    }
    onLoadIframe(app, e)
    {
        let key = e.target.id.replace("iframe_", "");
        if(key == "") return;
        app.loaded = true;
        app.iframe = e.target.contentWindow;
        app.iframe.EventUpdateFromApp = new CustomEvent("UpdateFromApp");
    }
    checkRepeatSoftware(type, id)
    {
        let i = 0;
        for(; i < this.tabs.length; i++) // Проверка на уже открытую вкладку
            if(this.tabs[i].type == type && this.tabs[i].software.inputs && this.tabs[i].software.inputs.id == id) break;
        return i;
    }
    searchObjectFromSticker(stick)
    {
        this.onChangeInSoftware({
            type: "openFromTable",
            value: {
                id: stick.objectId,
                name: stick.type == "tlist" ? "folder" : stick.type // Потому что 111 запрос предполагает для tlist другой поиск
            }
        })
    }
    removeSticker(stickId, i) // Удалить заметку
    {
        this.query.protectionPost(138, { param: [stickId] }, () =>
        {
            this.stickers.splice(i, 1);
        });
    }
    setCurrentStickers()
    {
        let screen = this.splitScreen.screens[this.splitScreen.currentScreen];
        if(screen.tabs[screen.currentSoftware])
            this.stickers = screen.tabs[screen.currentSoftware].stickers;
        else this.stickers = [];
    }
    /*******************************************************************/
    autoLogin(func) // Автовход
    {
        this.loaded = false;
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
            this.loaded = true;
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
        /* localStorage.removeItem("Tabs"); */
        /* localStorage.removeItem("Sectors"); */
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
        this.query.protectionPost(452, { param: ["user_tabs", "user_sectors", "user_favorites"] }, (data) =>
        {
            let saveTabs = data.user_tabs || [];
            let sectors = data.user_sectors;
            this.favorites = data.user_favorites || {};
            if(sectors) this.splitScreen.sectors = sectors;
            
            this.splitScreen.appendScreenBySectors();
            for(var i = 0; i < saveTabs.length; i++) 
                if(saveTabs[i])
                    this.openSoftware(saveTabs[i][0], saveTabs[i][1], { screen: saveTabs[i][2], current: saveTabs[i][3] });
        });
    }
    setActiveScreen(s) // Сделать экран активным
    {
        this.splitScreen.currentScreen = s;
        this.setCurrentStickers();
    }
}