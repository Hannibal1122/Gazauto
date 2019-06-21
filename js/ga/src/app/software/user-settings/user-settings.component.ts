import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
declare var $:any;
@Component({
    selector: 'user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.css'],
    providers: [ QueryService ]
})
export class UserSettingsComponent implements OnInit 
{
    @Output() onChange = new EventEmitter<any>();
    theme = "blue";
    backgrounds = [
        { type: "image", name: "theme1.png"},
        { type: "image", name: "theme2.jpg"},
        { type: "image", name: "theme3.jpg"},
        { type: "image", name: "theme4.jpg"},
        { type: "image", name: "theme5.jpg"},
        { type: "image", name: "theme6.jpg"},
        { type: "image", name: "theme7.jpg"},
        { type: "image", name: "theme8.jpg"},
        { type: "image", name: "theme9.jpg"},
        { type: "image", name: "theme10.jpg"},
        { type: "image", name: "theme11.jpg"},
        { type: "image", name: "theme12.jpg"},
        { type: "image", name: "theme13.jpg"},
        { type: "image", name: "theme14.jpg"},
        { type: "image", name: "theme15.jpg"},
        { type: "color", name: "#41b2f4"},
        { type: "color", name: "#75e5a1"},
        { type: "color", name: "#bae575"},
        { type: "color", name: "#e5df75"},
        { type: "color", name: "#e58275"},
        { type: "color", name: "#e175e5"},
        { type: "color", name: "#eeeeee"},
    ]
    constructor(private query:QueryService) 
    {
        this.query.protectionPost(451, { param: ["theme"] }, (data) =>
        {
            if(data.theme) this.theme = data.theme;
        });
    }
    ngOnInit() 
    {
        
    }
    setTheme(theme)
    {
        this.theme = theme;
        this.query.protectionPost(450, { param: [ "theme", JSON.stringify({ theme: this.theme }) ] });
        this.onChange.emit({ type: "changeTheme", value: { theme: this.theme } });
    }
    setBackground(background)
    {
        this.query.protectionPost(450, { param: [ "theme", JSON.stringify({ ...background, theme: this.theme }) ] });
        this.onChange.emit({ type: "changeTheme", value: { ...background, theme: this.theme } });
    }
}