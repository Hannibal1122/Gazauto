import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
declare var trace:any;
declare var $: any;
@Component({
    selector: 'datetimepicker',
    templateUrl: './datetimepicker.component.html',
    styleUrls: ['./datetimepicker.component.css']
})

export class DateTimeComponent implements AfterViewInit/* , OnChanges */ /*  implements OnInit */ 
{
    @ViewChild('mainInput') public mainInput: ElementRef;
    @ViewChild('CalendarDiv') public CalendarDiv: ElementRef;
    @Output() onChange = new EventEmitter<any>();
    //@Input() onChange;
    @Input() set config(config: any)
    {
        if(config) 
        {
            this.availabilityTime = config.time == undefined ? true : config.time;
            this.availabilityDay = config.day == undefined ? true : config.day;
            this.minSize = config.minSize;

            if(!this.availabilityDay) this.range = [[0, 2], [3, 7]];
            else if(!this.availabilityTime) this.range = [[0, 2], [3, 5], [6, 10]];
        }
    };
    @Input() set setValue(value: string) 
    { 
        if(value && typeof(value) == "string")
        {
            var date:any = value.split(" ")[0].split(".");
            if(this.availabilityTime) this.selectTime = value.split(" ")[1];
            this.ClickDay({day: Number(date[0]), month: Number(date[1]) - 1, year: Number(date[2])});
        } 
        else 
        {
            date = new Date();
            this.ClickDay({day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), time: "00:00"});
        }
    }
    load = false;
    currentDate;
    allDay = 42;
    pageYear;
    selectYear;
    selectMonth;
    selectTime:string;
    year;
    month;
    day;
    open = false;
    oldOpen = false;
    timeCalendar = [];
    yearCalendar = [];
    monthCalendar = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ];
    monthCalendarMin = [[]];// = [[ "янв", "фев", "мар"], ["апр", "май", "июн"], ["июл", "авг", "сен"], ["окт", "ноя", "дек" ]];
    yearCalendarMin;
    dayOnMonth = []
    dayCalendar = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    calendar = [];
    valid = true; // Проверка на правильность даты
    availabilityTime = true;
    availabilityDay = true;
    minSize = false;
    window = 0;
    range = [[0, 2], [3, 5], [6, 10], [11, 13], [14, 16]];
    currentSelection = 0;
    ngAfterViewInit(): void 
    {
        this.load = true;
    }
    constructor() 
    { 
        var self = this;
        for(var i = 0; i < 24; i++)
            this.timeCalendar.push((i < 10 ? "0" + i : i) + ":00");
        for(var i = 1995; i < 2040; i++)
            this.yearCalendar.push(i);
        var _i = 0;
        for(var i = 0; i < this.monthCalendar.length; i++)
        {
            if(i != 0 && i % 3 == 0)
            {
                _i++;
                this.monthCalendarMin[_i] = [];
            }
            this.monthCalendarMin[_i].push({name: this.monthCalendar[i].substring(0, 3).toLowerCase(), month: i});
        }    
        this.currentDate = new Date();
        this.pageYear = this.year = this.selectYear = this.currentDate.getFullYear();
        this.month = this.selectMonth = this.currentDate.getMonth();
        this.day = this.currentDate.getDate();
        this.selectTime = "00:00";
        this.changePageYear(0);
        this.updateCalendar();
        window.addEventListener("click", (e:any) =>
        {
            if(e.path == undefined) return;
            for(var i = 0; i < e.path.length; i++)
                if(e.path[i].localName == "datetimepicker") 
                {
                    self.oldOpen = self.open;
                    return;
                }
            if(self.open && self.oldOpen) self.openMenu();
            self.oldOpen = self.open;
        });
    }
    updateCalendar()
    {
        var dayOnMonth = 33 - new Date(this.year, this.month, 33).getDate();
        var beginDay = new Date(this.year, this.month, 1).getDay();
        if(beginDay - 1 < 0) beginDay = 6; // Начало с понедельника
        else beginDay--;
        this.calendar = [[]];
        var _i = 0;
        let beginDate= new Date(this.year, this.month, 1);
        beginDate.setDate(beginDate.getDate() - beginDay);
        let endDate = new Date(this.year, this.month, dayOnMonth);
        endDate.setDate(endDate.getDate() + 1);
        for(var i = 0; i < this.allDay; i++)
        {
            if(i != 0 && i % 7 == 0) this.calendar[++_i] = [];
            if(i < beginDay) 
            {
                this.calendar[_i].push({day: beginDate.getDate(), month: beginDate.getMonth(), year: beginDate.getFullYear()});
                beginDate.setDate(beginDate.getDate() + 1);
            }
            if(i >= beginDay && i < dayOnMonth + beginDay)
                this.calendar[_i].push({day: i - beginDay + 1, month: this.month, year: this.year});
            if(i >= dayOnMonth + beginDay)
            {
                this.calendar[_i].push({day: endDate.getDate(), month: endDate.getMonth(), year: endDate.getFullYear()});
                endDate.setDate(endDate.getDate() + 1);
            }
        }
    }
    ClickDay(date)
    {
        $(this.CalendarDiv.nativeElement).fadeOut(0);
        this.open = false;
        if(date.month != this.month || date.year != this.year)
        {
            this.year = date.year;
            this.month = date.month;
            this.updateCalendar();
        }
        var month = Number(date.month) + 1; // Потому что с нуля
        this.day = date.day;
        this.selectYear = date.year;
        this.selectMonth = date.month;
        if(date.time != undefined) this.selectTime = date.time;
        this.mainInput.nativeElement.value = (this.availabilityDay ? (date.day < 10 ? "0" + date.day : date.day) + "." : "") + (month < 10 ? "0" + month : month) + "." + date.year + (this.availabilityTime ?  " " + this.selectTime : "");
        var date:any = this.mainInput.nativeElement.value.split(" ")[0];
        var time = this.selectTime;
        
        this.onChange.emit({date: date, time: time, milliseconds: this.getTime()});
        this.valid = true;
    }
    getTime()
    {
        if(this.availabilityTime) 
        {
            var time1:any = this.selectTime.split(":");
            var time2 = Number(time1[1]);
            time1 = Number(time1[0]);
            return new Date(this.selectYear, this.selectMonth, this.day, time1, time2).getTime();
        }
        else return new Date(this.selectYear, this.selectMonth, this.day).getTime();
    }
    openMenu()
    {
        if(!this.open) $(this.CalendarDiv.nativeElement).fadeIn(200);
        else $(this.CalendarDiv.nativeElement).fadeOut(0);
        var position = $(this.mainInput.nativeElement).offset();
        var top = position.top + 30;
        if(top + 235 > document.documentElement.clientHeight) top = document.documentElement.clientHeight - 235;
        $(this.CalendarDiv.nativeElement).css({ top: top, left: position.left })
        this.open = !this.open;
        this.window = !this.availabilityDay ? 1 : 0;
    }
    OnChangeInput()
    {
        var re = /(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\d\d$/i;
        if(!this.availabilityDay) re = /(0[1-9]|1[012])[-/.](19|20)\d\d$/i;
        var reTime = /^([0-1]\d|2[0-3])(:[0-5]\d)$/i;
        var date:any = this.mainInput.nativeElement.value.split(" ")[0];
        var time = this.mainInput.nativeElement.value.replace(date + " ", "");
        if(!this.availabilityTime) time = "00:00";
        this.valid = reTime.test(time) && re.test(date); 
         
        if (this.valid) // Может придется убрать this.valid 
        {
            let i = 0;
            let _date = date.split(".");
            if(!this.availabilityDay) i = -1;
            let day = this.availabilityDay ? Number(_date[i]) : 1;
            let month = Number(_date[i + 1]) - 1;
            let year = Number(_date[i + 2]);
            this.ClickDay({day: day, month: month, year: year, time: time});
        }
    }
    OnclickInput(e)
    {
        for(var i = 0; i < this.range.length; i++)
            if(this.mainInput.nativeElement.selectionStart <= this.range[i][1] && this.mainInput.nativeElement.selectionStart >= this.range[i][0]) break;
        this.currentSelection = this.range[i][0];
        this.mainInput.nativeElement.setSelectionRange(this.range[i][0], this.range[i][1]);
    }
    OnBlurInput(e)
    {
        this.OnChangeInput();
    }
    selectWindowMonth()
    {
        this.window = 1;
    }
    selectWindowYear()
    {
        this.window = 2;
    }
    ClickMonth(month)
    {
        this.month = month;
        this.updateCalendar();
        if(this.availabilityDay) this.window--;
        else this.ClickDay({day: 1, month: this.month, year: this.year});
    }
    ClickYear(year)
    {
        this.year = year;
        this.updateCalendar();
        this.window--;
    }
    changePageYear(value)
    {
        if(value < 0 && this.pageYear < 1995) return;
        if(value > 0 && this.pageYear > 2040) return;
        this.pageYear += value;
        var _i = 0;
        this.yearCalendarMin = [[]];
        for(var i = 0; i < 12; i++)
        {
            if(i != 0 && i % 3 == 0)
            {
                _i++;
                this.yearCalendarMin[_i] = [];
            }
            this.yearCalendarMin[_i].push(this.pageYear + i);
        }
    }
    OnKeypressInput(e)
    {
        if(isNaN(Number(e.key))) return false;
        this.mainInput.nativeElement.value = this.replaceChar(this.mainInput.nativeElement.value, this.currentSelection, e.key);
        this.currentSelection++;
        for(var i = 0; i < this.range.length; i++)
            if(this.currentSelection <= this.range[i][1] && this.currentSelection >= this.range[i][0]) break;
        this.mainInput.nativeElement.setSelectionRange(this.range[i][0], this.range[i][1]);
        if(this.currentSelection == this.range[i][1] && this.range[i + 1] != undefined)
        {
            this.currentSelection++;
            this.mainInput.nativeElement.setSelectionRange(this.range[i + 1][0], this.range[i + 1][1])
        }
        if(this.currentSelection == this.range[i][1] && this.range[i + 1] == undefined)
            this.currentSelection--;
        this.OnChangeInput();
        return false;
    }
    OnKeydownInput(e)
    {
        if(e.keyCode == 8)
        {
            for(var i = 0; i < this.range.length; i++)
                if(this.currentSelection <= this.range[i][1] && this.currentSelection >= this.range[i][0]) break;
            if(this.range[--i] != undefined)
            {
                this.currentSelection = this.range[i][0];
                this.mainInput.nativeElement.setSelectionRange(this.range[i][0], this.range[i][1])
            }
        }
        if(e.keyCode == 9)
        {
            for(var i = 0; i < this.range.length; i++)
                if(this.currentSelection <= this.range[i][1] && this.currentSelection >= this.range[i][0]) break;
            if(this.range[++i] != undefined)
            {
                this.currentSelection = this.range[i][0];
                this.mainInput.nativeElement.setSelectionRange(this.range[i][0], this.range[i][1])
            }
        }
        if(isNaN(Number(e.key))) return false;
    }
    replaceChar = function(str, pos, chars)
    {
        return str.substring(0, pos) + chars + str.substring(pos + 1, str.length);
    }
}