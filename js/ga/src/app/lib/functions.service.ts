import { Injectable } from '@angular/core';
declare var trace:any;
@Injectable()
export class FunctionsService 
{
    constructor() {}
    getUnicName(inputText) // Уникальное имя
    {
        var n = this.getRandom(0, 12);
        for(var i = 0; i < 10; i++)
        {
            if(n < 4)
                inputText += String.fromCharCode(this.getRandomF(65, 91));
            else
                if(n < 8)
                    inputText += String.fromCharCode(this.getRandomF(97, 123));
                else inputText += this.getRandomF(0, 9);
            n = this.getRandom(0, 12);
        }
        return inputText;
    }
    getRandom(min, max) // случайное число из диапозона вещественное
    {
        return Math.random() * (max - min) + min;
    }
    getRandomF(min, max) // случайное число из диапозона вещественное
    {
        return Math.floor(Math.random() * (max - min) + min);
    }
    getRandomElem(array)
    {
        return (array[this.getRandomF(0, array.length)]);
    }
    getTimer() // текущее время
    {
        return (new Date()).getTime();
    }
    recodeRights(rights, n)
    {
        var out = [];
        for(var i = 0; i < n; i++)
        {
            out.push(rights & 1)    
            rights >>= 1;
        }
        // "Шаблоны и типы"
        // "Таблицы"
        // "Пользователи и роли"
        // "Права"  
        // "События"
        return out;
    }
    encodeRights(rights)
    {
        var out = 0;
        for(var i = rights.length - 1; i >= 0; i--)
        {
            out |= Number(rights[i]); 
            if(i != 0) out <<= 1; 
        }
        return out;
    }
    getColorForName(color)
    {
        switch(color)
        {
            case "Красный":
                return "#bb4545"; 
            case "Желтый":
                return "#b9c051"; 
            case "Зеленый":
                return "#4dc561"; 
        }
    }
    getNameForColor(color)
    {
        switch(color)
        {
            case "#bb4545":
                return "Красный"; 
            case "#b9c051":
                return "Желтый"; 
            case "#4dc561":
                return "Зеленый"; 
        }
    }
    getFormat(str, format?)
    {
        var out = format ? format : "dd.MM.yyyy HH:mm";
        var a = str.split(" ");
        var b = a[0].split("-");
        var day = b[2] ? b[2] : "01";
        var month = b[1] ? b[1] : "01";
        var year = b[0] ? b[0] : "1993";
        var time = a[1] ? a[1] : "00:00";
        
        out = out.replace("yyyy", year);
        out = out.replace("MM", month);
        out = out.replace("dd", day);
        out = out.replace("HH:mm", time);
        return out;
    }
    getFormatForMilliseconds(milliseconds, format?)
    {
        var out = format ? format : "yyyy-MM-dd HH:mm";
        var d = new Date(milliseconds);
        var month:any = d.getMonth() + 1;
        if(month < 10) month = "0" + month;
        var day:any = d.getDate();
        if(day < 10) day = "0" + day;
        var h:any = d.getHours();
        if(h < 10) h = "0" + h;
        var min:any = d.getMinutes();
        if(min < 10) min = "0" + min;

        out = out.replace("yyyy", d.getFullYear());
        out = out.replace("MM", month);
        out = out.replace("dd", day);
        out = out.replace("HH", h);
        out = out.replace("mm", min);
        return out;
    }
}