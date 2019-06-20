import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
//import { employees } from '../../employees';

declare var trace:any;

@Component({
  selector: 'app-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.css']
})
export class PlanEditorComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;

    planProperty = {
        error: false,
        month: "",
        year: ""
    }
    loaded = false;
    right: any = {};
    name;
    dataHeader;
    dataHeaderDays = [];
    mapHeader = {};
    dataTable;
    inputs = { id: -1 };
    interval = {
        i: -1,
        begin: -1,
        end: -1,
        firstJ: -1
    }
    constructor(public query: QueryService) { }
    ngOnInit() 
    {
        this.loadTable();
    }
    loadTable()
    {
        this.loaded = false;
        this.query.protectionPost(250, { param: [ this.inputs.id ]}, (data) => 
        {
            if(data.head == undefined) 
            {
                this.planProperty.error = true;
                return;
            }
            this.planProperty.error = false;
            for(let key in data.right) this.right[key] = data.right[key];
            this.right.head = data.changeHead;
            this.name = data.name;
            this.dataHeader = [];
            this.dataTable = [];
            // Формирование заголовка
            for(let i = 0; i < data.head.length; i++)
            {
                let _j = data.head[i][0];
                this.dataHeader[_j] = { 
                    id: data.head[i][1], 
                    name: data.head[i][2]
                };
                this.mapHeader[this.dataHeader[_j].id] = _j;
            }
            for(let i = 0; i < data.data.length; i++)
            {
                this.dataTable[i] = [];
                for(let j in data.data[i])
                    this.dataTable[i][this.mapHeader[j]] = data.data[i][j];
            }
            this.convertEmployees();
            this.query.protectionPost(133, { param: [ this.inputs.id ]}, (data) => 
            {
                let property = JSON.parse(data.userProperty);
                for(let i = 0; i < property.length; i++)
                {
                    if(property[i].name == "месяц") this.planProperty.month = property[i].value;
                    if(property[i].name == "год") this.planProperty.year = property[i].value;
                }
                this.dataHeaderDays[0] = "";
                for(let i = 1; i < this.dataHeader.length; i++)
                    this.dataHeaderDays[i] = this.getWeekDay(new Date(Number(this.planProperty.year), this.getMonth(this.planProperty.month), i));
                this.loaded = true;
            });
        });
        /* var date = ; // 3 января 2014
        alert( getWeekDay(date) ); // 'пт' */
    }
    outEmployees = [];
    convertEmployees()
    {
        this.outEmployees = [];
        for(let i = 0; i < this.dataTable.length; i++)
        {
            this.outEmployees[i] = {
                name: this.dataTable[i][0].value,
                days: []
            }
            let newLiteral = false;
            let day, lastDay;
            let lastI;
            for(let j = 1; j < this.dataTable[i].length; j++)
            {
                lastDay = j == 1 ? false : this.dataTable[i][j - 1];
                day = this.dataTable[i][j];
                if((day.value == "К" || day.value == "Вых" || day.value == "От") && (lastDay.value === day.value))
                {
                    this.outEmployees[i].days[lastI].colspan++;
                    continue;
                }
                lastI = this.outEmployees[i].days.length;
                this.outEmployees[i].days[lastI] = { 
                    value: day.value, 
                    color: day.color,
                    day: j,
                    colspan: 1 
                };
            }
        }
    }
    updateInterval(j)
    {
        if(this.interval.i != -1)
        {
            if(this.interval.firstJ > j)
            {
                this.interval.end = this.interval.firstJ;
                this.interval.begin = j;
            }
            else 
            {
                this.interval.begin = this.interval.firstJ;
                this.interval.end = j;
            }
        }
    }
    selectInterval(i, j)
    {
        if(this.interval.i == -1)
        {
            this.interval.i = i;
            this.interval.firstJ = j;
            this.interval.begin = j;
        }
        else 
        {
            let days = this.outEmployees[this.interval.i].days;
            let titleText;
            let begin = days[this.interval.begin].day;
            let end = days[this.interval.end].day;
            let month = "";
            let lMonth = this.planProperty.month.length;
            let lastLit = this.planProperty.month[lMonth - 1];
            if(lastLit == "ь" || lastLit == "й") month = this.planProperty.month.slice(0, lMonth - 1) + "я";
            else month = this.planProperty.month + "а";
            end += days[this.interval.end].colspan - 1;
            if(begin == end) titleText = `Изменить на ${ begin } ${ month }`;
            else titleText = `Изменить с ${ begin } по ${ end } ${ month }`;

            let Data:any = {
                title: titleText,  
                data: [
                    ["Значение", "", "text"],
                    ["Цвет", "", "text"]
                ],
                ok: "Изменить",
                cancel: "Отмена"
            };

            this.modal.open(Data, (save) =>
            {
                if(save == true)
                {
                    let value = Data.data[0][1];
                    let color = Data.data[1][1];
                    let out = [];
                    for(let j = begin; j <= end; j++)
                        out.push({
                            id: this.dataTable[this.interval.i][j].id,
                            value: value,
                            color: color
                        });
                    this.query.protectionPost(402, { param: [ JSON.stringify(out) ]}, (data) => 
                    {
                        this.loadTable();
                    });
                };
                for(let key in this.interval) this.interval[key] = -1;
            });
        }
    }
    getMonth(month)
    {
        return { 
            "январь": 0, 
            "февраль": 1, 
            "март": 2, 
            "апрель": 3, 
            "май": 4, 
            "июнь": 5, 
            "июль": 6, 
            "август": 7,
            "сентябрь": 8,
            "октябрь": 9,
            "ноябрь": 10,
            "декабрь": 11,
        }[month];
    }
    getWeekDay(date) 
    {
        var days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        return days[date.getDay()];
    }
    setPresentDays() // Вычислить все выходные и выставить значения
    {
        let out = [];
        let workDay = "9";
        let shortWorkDay = "8:15";
        for(let i = 0; i < this.dataTable.length; i++)
            for(let j = 1; j < this.dataTable[i].length; j++)
            {
                switch(this.dataHeaderDays[j])
                {
                    case "пн":
                    case "вт":
                    case "ср":
                    case "чт":
                        if(this.dataTable[i][j].value == "") out.push({ id: this.dataTable[i][j].id, value: workDay });  
                        break;
                    case "пт":
                        if(this.dataTable[i][j].value == "") out.push({ id: this.dataTable[i][j].id, value: shortWorkDay });  
                        break;
                    case "сб":
                    case "вс":
                        if(this.dataTable[i][j].value != "Вых") out.push({ id: this.dataTable[i][j].id, value: "Вых" });  
                        break;
                }
            }
        /* trace(this.dataTable)
        trace(out) */
        this.query.protectionPost(402, { param: [ JSON.stringify(out) ]}, (data) => 
        {
            this.loadTable();
        });
    }
    clearPlan()
    {
        let out = [];
        for(let i = 0; i < this.dataTable.length; i++)
            for(let j = 1; j < this.dataTable[i].length; j++)
                out.push({ id: this.dataTable[i][j].id, value: "" });  
        this.query.protectionPost(402, { param: [ JSON.stringify(out) ]}, (data) => { this.loadTable(); });
    }
}