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
                this.mainProperty[8].value = data.idTable > 0 ? { type: "table", id: data.idTable } : null;
                if(value.objectType == "tlist")
                    this.mainProperty[9].value = data.idFilter > 0 ? { type: "filter", id: data.idFilter } : { type: "filter", id: "" };
                else this.mainProperty[9].value = null;

                let i = 0;
                for(; i < this.userProperty.length; i++)
                    if(this.userProperty[i].name == "Аннотация") break;
                if(i == this.userProperty.length)
                    this.userProperty.push({ name: "Аннотация", value: "", type: "annotation" });
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
                
                let i = 0;
                for(; i < this.userProperty.length; i++)
                    if(this.userProperty[i].name == "Аннотация") break;
                if(i == this.userProperty.length)
                    this.userProperty.push({ name: "Аннотация", value: "", type: "annotation" });
            });
            this.change = false;
            /* this.property = [ ...this.mainPropertyField ]; */
        }
    }
    setDefaultProperty(data)
    {
        this.id = data.id;
        if(this.type == "main") this.property = [ ...this.mainProperty ];
        if(this.type == "field") 
        {
            this.property = [ ...this.mainPropertyField ];
            if(data.type !== "head")
            {
                this.property.push({ name: "color", desc: "цвет", value: "", type: "edit"});
                this.property.push({ name: "column", desc: "столбец", value: "", type: "block"});
                this.property.push({ name: "row", desc: "строка", value: "", type: "block"});
            }
            else this.property.push({ name: "variable", desc: "Переменная", value: "", type: "edit"});
        }
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
        { name: "timeCreate", desc: "Создан", value: "", type: "block"},
        { name: "table", desc: "Таблица", value: {}, type: "table"},
        { name: "filter", desc: "Фильтр", value: {}, type: "object"}
    ]
    mainPropertyField =
    [
        { name: "id", desc: "id", value: "", type: "block"},
        
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
                    case "filter":
                        this.query.protectionPost(108, { param: [ this.id, this.saveQueue[key].id ] });
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
                    case "variable":
                        let variable = this.saveQueue[key] ? this.saveQueue[key] : null;
                        this.query.protectionPost(277, { param: [ this.id, variable === null ? "NULL" : variable ] }, (data) => 
                        { 
                            /* this.onSave.emit({ variable: variable }); */
                        });
                        break;
                }
            }
            for(let i = 0; i < this.userProperty.length; i++)
                if(this.userProperty[i].name == "width")
                {
                    this.onSave.emit({ width: this.userProperty[i].value });
                    break;
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
        if(this.userProperty[i].type == "annotation") this.userProperty[i].value = "";
        else this.userProperty.splice(i, 1);
        this.change = true;
    }
    onInputChangeUser()
    {
        this.change = true;
    }
    openObject(p)
    {
        trace(p)
        if(p.value.type == "filter" || p.value.type == "file" || p.value.type == "folder" || p.value.type == "tlist") this.query.onChange({ type: "openFromTable", value: { name: p.value.type, id: p.value.id }});
        else this.query.onChange({ type: "openFromTable", value: { type: "open", name: p.value.type, id: p.value.id }});
    }
    pasteObject(p)
    {
        if(localStorage.getItem("copyExplorer"))
        {
            let data = JSON.parse(localStorage.getItem("copyExplorer"));
            p.value = { id: data.id, type: data.objectType };

            if(p.name == "filter") this.onInputChange(p);
            else this.onInputChangeUser();
        }
    }
}
