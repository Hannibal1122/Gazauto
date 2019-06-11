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
            this.availabilityMonth = config.month == undefined ? true : config.month;
            this.minSize = config.minSize;

            if(!this.availabilityMonth) this.range = [[0, 4]]; // Для года
            else if(!this.availabilityDay) this.range = [[0, 2], [3, 7]]; // Для месяца и года
            else if(!this.availabilityTime) this.range = [[0, 2], [3, 5], [6, 10]]; // Для дня месяца года

            if(config.error != undefined) this.error = config.error;
            if(config.block != undefined) this.block = config.block;
        }
    };
    @Input() set setValue(value: string)
    {
        if(value)
        {
            let timeValue = value.split(" ");
            let date:any = timeValue[0].split(".");
            if(this.availabilityTime) this.selectTime = timeValue[1];
            this.ClickDay({day: Number(date[0]), month: Number(date[1]) - 1, year: Number(date[2]), set: true});
        }
        else
        {
            let date = new Date();
            this.ClickDay({day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), time: "00:00", set: true});
        }
    }
    error = false;
    block = false;
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
    monthCalendar = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ];
    monthCalendarMin = [[]];// = [[ "янв", "фев", "мар"], ["апр", "май", "июн"], ["июл", "авг", "сен"], ["окт", "ноя", "дек" ]];
    yearCalendarMin;
    dayOnMonth = []
    dayCalendar = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    calendar = [];
    availabilityTime = true;
    availabilityDay = true;
    availabilityMonth = true;
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
        for(var i = 0; i < 24; i++) this.timeCalendar.push(this.addZeros(i) + ":00");
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
        this.year = this.selectYear = this.currentDate.getFullYear();
        this.pageYear = Math.floor(this.year / 12) * 12;
        this.month = this.selectMonth = this.currentDate.getMonth();
        this.day = this.currentDate.getDate();
        this.selectTime = "00:00";
        this.changePageYear(0);
        this.updateCalendar();
        this.globalClick = (e:any) =>
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
        };
        window.addEventListener("click", this.globalClick);
    }
    globalClick = null;
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
        this.changePageYear(0);
    }
    ClickDay(date)
    {
        $(this.CalendarDiv.nativeElement).fadeOut(0);
        this.open = false;
        if(date.time != undefined) this.selectTime = date.time;

        /*************************Проверка даты************************/
        let _time = this.selectTime.split(":");
        let hour = date.hour != undefined ? date.hour : Number(_time[0]);
        let minutes = date.minutes != undefined ? date.minutes : Number(_time[1]);
        let testDate = new Date(date.year, date.month, date.day, hour, minutes);
        date.year = testDate.getFullYear();
        date.month = testDate.getMonth();
        date.day = testDate.getDate();
        this.selectTime = this.getTimeStr(testDate.getHours(), testDate.getMinutes());
        let set = date.set ? true : false;
        if(date.month != this.month || date.year != this.year)
        {
            this.year = date.year;
            this.month = date.month;
            this.updateCalendar();
        }
        var month = date.month + 1; // Потому что с нуля
        this.day = date.day;
        this.selectYear = date.year;
        this.selectMonth = date.month;

        this.mainInput.nativeElement.value =
          (this.availabilityDay ? this.addZeros(date.day) + "." : "") +
          (this.availabilityMonth ? this.addZeros(month) + "." : "") +
          date.year +
          (this.availabilityTime ?  " " + this.selectTime : "");
        var date:any = this.mainInput.nativeElement.value.split(" ")[0];
        var time = this.selectTime;
        this.onChange.emit({date: date, time: time, milliseconds: this.getTime(), set: set});
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
        if(top + 235 > document.documentElement.clientHeight) top = document.documentElement.clientHeight - 245;
        $(this.CalendarDiv.nativeElement).css({ top: top, left: position.left })
        this.open = !this.open;

        if (this.availabilityDay)
          this.window = 0;
        else if (this.availabilityMonth)
          this.window = 1;
        else
          this.window = 2;
    }
    OnChangeInput()
    {
        var date:any = this.mainInput.nativeElement.value.split(" ")[0];
        var time = this.mainInput.nativeElement.value.replace(date + " ", "").split(":");
        if(!this.availabilityTime) time = [0, 0];
        let i = 0;
        let _date = date.split(".");
        if(!this.availabilityDay) i -= 1;
        if(!this.availabilityMonth) i -= 1;
        let day = this.availabilityDay ? Number(_date[i]) : 1;
        let month = this.availabilityMonth ?Number(_date[i + 1]) - 1 : 1;
        let year = Number(_date[i + 2]);
        let hour = Number(time[0]);
        let minutes = Number(time[1]);
        if(day < 32 && month < 12 && hour < 24 && minutes < 60) 
            this.ClickDay({day: day, month: month, year: year, hour: hour, minutes: minutes });
        else this.mainInput.nativeElement.value =
          (this.availabilityDay ? this.addZeros(this.day) + "." : "") +
          (this.availabilityMonth ? this.addZeros(this.selectMonth + 1) + "." : "") +
          this.selectYear +
          (this.availabilityTime ?  " " + this.selectTime : "");
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
        if(this.availabilityMonth) this.window--;
        else this.ClickDay({day: 1, month: 1, year: this.year});
    }
    changePageYear(value)
    {
        if(value < 0 && this.pageYear < 1970) return;
        if(value > 0 && this.pageYear > 2100) return;
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
        switch(this.currentSelection) { case 2: case 5: case 10: case 13: this.OnChangeInput(); break; } // проверка на введенные значения
        if(this.currentSelection == this.range[i][1] && this.range[i + 1] != undefined)
        {
            this.currentSelection++;
            this.mainInput.nativeElement.setSelectionRange(this.range[i + 1][0], this.range[i + 1][1])
        }
        if(this.currentSelection == this.range[i][1] && this.range[i + 1] == undefined) this.currentSelection--;
        return false;
    }
    OnKeydownInput(e)
    {
        if(e.keyCode == 8 || e.keyCode == 37) this.setRange(-1);
        if(e.keyCode == 9 || e.keyCode == 39) this.setRange(1);
        if(e.keyCode == 38 || e.keyCode == 40)
        {
            let error = e.keyCode == 38 ? 1 : -1;
            let time = this.selectTime.split(":");
            let i = this.getRange();
            let addDate = { day: 0, month: 0, year: 0, hour: 0, minutes: 0 }
            switch(i)
            {
                case 0: // Выбран первый диапазон
                    if(!this.availabilityMonth) addDate.year = error;
                    else if(!this.availabilityDay) addDate.month = error;
                    else addDate.day = error;
                    break;
                case 1: 
                    if(!this.availabilityDay) addDate.year = error;
                    else addDate.month = error;
                    break;
                case 2:
                    addDate.year = error;
                    break;
                case 3:
                    addDate.hour = error;
                    break;
                case 4:
                    addDate.minutes = error;
                    break;
            }
            this.ClickDay({
                day: this.day + addDate.day,
                month: this.month + addDate.month,
                year: this.year + addDate.year,
                hour: Number(time[0]) + addDate.hour,
                minutes: Number(time[1]) + addDate.minutes
            });
            this.setRange(0);
        }
        if(isNaN(Number(e.key))) return false;
    }
    getTimeStr(hour, minutes)
    {
        return this.addZeros(hour) + ":" + this.addZeros(minutes);
    }
    addZeros(value) // Добавить в строку нули если число меньше 10
    {
        return (value < 10 ? "0" + value : value);
    }
    getRange()
    {
        for(var i = 0; i < this.range.length; i++)
            if(this.currentSelection <= this.range[i][1] && this.currentSelection >= this.range[i][0]) break;
        return i;
    }
    setRange(error) // выделить диапазон
    {
        let i = this.getRange();
        i += error;
        if(this.range[i] != undefined)
        {
            this.currentSelection = this.range[i][0];
            this.mainInput.nativeElement.setSelectionRange(this.range[i][0], this.range[i][1])
        }
    }
    replaceChar = function(str, pos, chars)
    {
        return str.substring(0, pos) + chars + str.substring(pos + 1, str.length);
    }
    ngOnDestroy() { window.removeEventListener("click", this.globalClick); }
}