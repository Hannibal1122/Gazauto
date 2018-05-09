import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExplorerComponent } from './software/explorer/explorer.component';
import { QueryService } from "./lib/query.service";
import { FunctionsService } from "./lib/functions.service";
import { TableEditorComponent } from './software/table-editor/table-editor.component';

declare var trace:any;
/* declare var TestData:any; */

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [QueryService, FunctionsService]
})
export class AppComponent implements OnInit
{
   
    timeSend = 900000;
    firstEnterBool = false;
    enter = false;
    load = false;
    /* testData = [];//TestData; */
    leftMenuData = [];
    tabs = [];
    Login = "";
    
    currentSoftware = 0;
    hideSoftware = false;
    constructor(private query: QueryService, private lib: FunctionsService) { }
    ngOnInit(): void 
    {
        this.autoLogin(() => 
        { 
            this.enter = true; 
            this.Login = localStorage.getItem("login");
        });
        this.firstEnter(this);
        this.refresh();
        this.openSoftware("explorer", { });
        /* this.openSoftware("table", { id: 66 }); */
    }
    openTab(i)
    {
        this.currentSoftware = i;
    }
    closeTab(i)
    {
        this.tabs.splice(i, 1);
        if(i < this.currentSoftware) this.currentSoftware--;
        else if(i == this.currentSoftware)
        {
            if(this.tabs[i]) this.currentSoftware = i;
            else if(this.tabs[i - 1]) this.currentSoftware = i - 1;
        }
    }
    refresh()
    {
        this.query.protectionPost(113, { param: [] }, (data) => 
        { 
            this.leftMenuData = data; 
        });
    }
    openObjectForLeftMenu = (() => 
    { 
        return (type, input) => { this.openSoftware(type, input); }
    })();

    openSoftware(type, input?)
    {
        switch(type)
        {
            case "explorer":
                this.tabs.push(
                {
                    name: "Проводник",
                    type: "explorer",
                    software:{
                        component: ExplorerComponent,
                        inputs: 
                        { 
                            openSoftware: (type, input) => { this.openSoftware(type, input); },
                            data: input
                        }
                    }
                })
                break;
            case "table":
                this.tabs.push(
                {
                    name: "Редактор таблицы",
                    type: "table",
                    software:{
                        component: TableEditorComponent,
                        inputs: input
                    }
                })
                break;
        }
        this.currentSoftware = this.tabs.length - 1;
    }
    hideMenuSoftware()
    {
        this.hideSoftware = !this.hideSoftware;
    }
    autoLogin(func)
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
    firstEnter(self)
    {
        if(localStorage.getItem("ID") === null)
            localStorage.setItem("ID", self.lib.getUnicName("G"));
        if(localStorage.getItem("timeSend") === null || Number(localStorage.getItem("timeSend")) < self.lib.getTimer() || !self.firstEnterBool)
        {
            self.query.post(1, { paramI: localStorage.getItem("ID") }, (data) =>
            {
                if(data.length == 0)
                    self.query.post(2, {param: [localStorage.getItem("ID"), '', '', '@DATE@']}, function(data)
                    {
                    });
                else
                    self.query.post(3, {param: ["@DATE@", localStorage.getItem("ID")]}, function(data)
                    {
                    });
            });	
            localStorage.setItem("timeSend", self.lib.getTimer() + self.timeSend);
            self.firstEnterBool = true;
        }
        setTimeout(() => { self.firstEnter(self) }, self.timeSend);
    }
    exitLogin()
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
