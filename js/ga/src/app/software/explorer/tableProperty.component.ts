import { Component, OnInit, Injector, ViewChild, Input, EventEmitter, Output } from '@angular/core';
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
    type = "main";
    @Output() onSave = new EventEmitter<any>();
    @Input() set mainData(value)
    {
        if(value)
        {
            this.type = "main";
            this.setDefaultProperty(value);
            this.query.protectionPost(133, { param: [ value.id ] }, (data) => // Запрос таблицы свойств
            {
                this.mainProperty[2].value = data.hashtag;
                this.mainProperty[3].value = data.priority;
                let icon = 
                {
                    state: (data.icon & 1) == 1,
                    count: (data.icon & 2) == 2
                }
                this.mainProperty[4].value = icon.state; // Нумерация используется при сохранении, при сдвиге основного массива учитывать
                this.mainProperty[5].value = icon.count;

                this.mainProperty[7].value = data.timeCreate;
                this.userProperty = data.userProperty ? JSON.parse(data.userProperty) : [];
            });
            this.change = false;
            /* this.property = [ ...this.mainProperty ]; */
        }
    }
    @Input() set mainDataField(value)
    {
        if(value)
        {
            this.type = "field";
            this.setDefaultProperty(value);
            this.query.protectionPost(272, { param: [ value.id ] }, (data) => // Запрос таблицы свойств
            {
                this.userProperty = data.userProperty ? JSON.parse(data.userProperty) : [];
            });
            this.change = false;
            /* this.property = [ ...this.mainPropertyField ]; */
        }
    }
    setDefaultProperty(data)
    {
        this.id = data.id;
        if(this.type == "main") this.property = [ ...this.mainProperty ];
        if(this.type == "field") this.property = [ ...this.mainPropertyField ];
        for(let i = 0; i < this.property.length; i++)
            if(this.property[i].name in data)
                this.property[i].value = data[this.property[i].name];
    }
    selectRules = {
        change: false,
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
                    if(!this.selectRules.change) this.mainProperty[i].type = "block"; // remove используется потому что содержит оригинальное право на изменение
                    else this.mainProperty[i].type = "edit";
                }
            }
        }
    }
    update = null;
    change = false; // Есть ли изменения
    // Для объекта структуры
    mainProperty =
    [
        { name: "id", desc: "id", value: "", type: "block"},
        { name: "name", desc: "Имя", value: "", type: "edit"},
        { name: "#", desc: "#", value: "", type: "edit"},
        { name: "priority", desc: "Приоритет", value: "", type: "edit"},
        { name: "state", desc: "Статус", value: false, type: "checkbox"},
        { name: "count", desc: "Количество", value: false, type: "checkbox"},
        { name: "objectType", desc: "Тип", value: "", type: "block"},
        { name: "timeCreate", desc: "Создан", value: "", type: "block"}
    ]
    mainPropertyField =
    [
        { name: "id", desc: "id", value: "", type: "block"},
        { name: "color", desc: "цвет", value: "", type: "edit"},
    ]
    userProperty = [];
    property = [];
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
        if(this.type == "main") // Для проводника
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
                    case "priority":
                    case "state":
                    case "count":
                        let icon = 12 | (Number(this.mainProperty[4].value)) | (Number(this.mainProperty[5].value) << 1)
                        this.query.protectionPost(116, { param: [ this.mainProperty[3].value, icon, this.id ] });
                        break;
                }
            }
            this.query.protectionPost(134, { param: [ this.id, JSON.stringify(this.userProperty) ] });
        }
        if(this.type == "field") // Для ячейки
        {
            for(let key in this.saveQueue)
            {
                switch(key)
                {
                    case "color":
                        let color = this.saveQueue[key].length == 7 ? this.saveQueue[key] : null;
                        this.query.protectionPost(271, { param: [ this.id, color === null ? "NULL" : color ] }, (data) => 
                        { 
                            this.onSave.emit({ color: color });
                        });
                        break;
                }
            }
            this.query.protectionPost(273, { param: [ this.id, JSON.stringify(this.userProperty) ] });
        }
        this.saveQueue = {};
        this.change = false;
    }
    addUserProperty()
    {
        this.userProperty.push({ name: "", value: "" });
    }
    removeUserProperty(i)
    {
        this.userProperty.splice(i, 1);
        this.change = true;
    }
    onInputChangeUser()
    {
        this.change = true;
    }
}
