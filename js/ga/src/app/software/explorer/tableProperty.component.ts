import { Component, OnInit, Injector, ViewChild, Input } from '@angular/core';
import { QueryService } from "../../lib/query.service";

declare var trace:any;
@Component({
    selector: 'app-table-property',
    templateUrl: './tableProperty.component.html',
    styleUrls: ['./tableProperty.component.css'],
    providers: [ QueryService ]
})
export class TablePropertyComponent implements OnInit 
{
    id = -1;
    @Input() set mainData(value)
    {
        if(value)
        {
            this.id = value.id;
            for(let i = 0; i < this.mainProperty.length; i++)
            {
                if(this.mainProperty[i].name in value)
                {
                    this.mainProperty[i].value = value[this.mainProperty[i].name];
                }
            }
            this.query.protectionPost(133, { param: [ value.id ] }, (data) => // Запрос таблицы свойств
            {
                this.mainProperty[2].value = data.hashtag;
                this.mainProperty[4].value = data.timeCreate;
                this.userProperty = data.userProperty ? JSON.parse(data.userProperty) : [];
            });
            this.change = false;
            /* this.property = [ ...this.mainProperty ]; */
        }
    }
    selectRules = {
        new: true, 
        copy: false, 
        paste: false, 
        cut: false, 
        rights: false, 
        remove: false,
        download: false,
        info: false,
        rename: false
    };
    @Input() set rules(value)
    {
        if(value) 
        {
            this.selectRules = value;
            for(let i = 0; i < this.mainProperty.length; i++)
            {
                if(this.mainProperty[i].name == "name")
                {
                    if(!this.selectRules.rename) this.mainProperty[i].type = "block";
                    else this.mainProperty[i].type = "edit";
                }
                if(this.mainProperty[i].name == "#")
                {
                    if(!this.selectRules.remove) this.mainProperty[i].type = "block"; // remove используется потому что содержит оригинальное право на изменение
                    else this.mainProperty[i].type = "edit";
                }
            }
        }
    }
    update = null;
    change = false; // Есть ли изменения
    mainProperty =
    [
        { name: "id", desc: "id", value: "", type: "block"},
        { name: "name", desc: "Имя", value: "", type: "edit"},
        { name: "#", desc: "#", value: "", type: "edit"},
        { name: "objectType", desc: "Тип", value: "", type: "block"},
        { name: "timeCreate", desc: "Создан", value: "", type: "block"}
    ]
    userProperty = [];
    property = []
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
    }
    saveQueue = {};
    onInputChange(property)
    {
        this.saveQueue[property.name] = property.value;
        this.change = true;
    }
    saveProperty()
    {
        for(let key in this.saveQueue)
        {
            switch(key)
            {
                case "name":
                    if(this.saveQueue[key] != "")
                        this.query.protectionPost(120, { param: [ this.id, this.saveQueue[key] ] }, (data) => 
                        { 
                            if(this.update) this.update();
                        });
                    break;
                case "#":
                    if(this.saveQueue[key] != "")
                        this.query.protectionPost(135, { param: [ this.id, this.saveQueue[key] ] });
                    break;
            }
        }
        this.query.protectionPost(134, { param: [ this.id, JSON.stringify(this.userProperty) ] });
        this.change = false;
    }
    addUserProperty()
    {
        this.userProperty.push({ name: "", value: "" });
    }
    removeUserProperty(i)
    {
        this.userProperty.splice(i, 1);
    }
    onInputChangeUser()
    {
        this.change = true;
    }
}
