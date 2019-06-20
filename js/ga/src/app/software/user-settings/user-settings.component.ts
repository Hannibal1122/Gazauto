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
    themes = [
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
    }
    ngOnInit() 
    {
        
    }
    setTheme(theme)
    {
        this.query.protectionPost(450, { param: [ "theme", JSON.stringify(theme) ] });
        this.onChange.emit({ type: "changeTheme", value: theme });
    }
}