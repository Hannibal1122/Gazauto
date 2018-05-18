import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
declare var $:any;
declare var trace:any;

@Injectable()
export class QueryService 
{
    //url = 'http://localhost/gazprom/scripts/main.php';
    url = 'http://localhost:8081/gazprom/scripts/main.php';
    constructor() 
    { 
        /* $.ajaxSetup({ headers: {  'Access-Control-Allow-Origin': 'http://localhost:8081' } }); */
    }
    post(n, data, func)
    {
        var dataQuery = {nquery: n};
        for(var key in data) dataQuery[key] = data[key];
        $.post(this.url, dataQuery, (data) =>
        {
            func(this.recode(data));
        });
    }
    protectionPost(n, data, func)
    {
        var dataQuery = {nquery: n};
        for(var key in data) dataQuery[key] = data[key];
        dataQuery["paramI"] = localStorage.getItem("ID");
        dataQuery["paramL"] = localStorage.getItem("login");
        dataQuery["paramC"] = localStorage.getItem("checkKey");
        $.post(this.url, dataQuery, (data) =>
        {
            func(this.recode(data));
        });
    }
    uploadFile(n, data, func)
    {
        var xhr:any = new XMLHttpRequest();
        // обработчик для закачки
        /* xhr.upload.onprogress = function(event) 
        {
            trace(event.loaded + ' / ' + event.total);
        } */
        var xhrData:any = new FormData(data);
		xhrData.append("nquery", n);
		xhrData.append("paramI", localStorage.getItem("ID"));
		xhrData.append("paramL", localStorage.getItem("login"));
		xhrData.append("paramC", localStorage.getItem("checkKey"));
		xhr.open("POST", this.url, true);
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("X-File-Name", xhrData.name);
        xhr.send(xhrData);
        xhr.onreadystatechange = () =>
		{
			if (xhr.readyState != 4) return;
			clearTimeout(timeout) // очистить таймаут при наступлении readyState 4
			if (xhr.status == 200) if(func) func(this.recode(xhr.responseText));
			else trace("Ошибка: " + xhr.statusText) // вызвать обработчик ошибки с текстом ответа
		}
		var timeout = setTimeout( function(){ xhr.abort(); trace("Время ожидания истекло, проверьте подключение к серверу!"); }, 10000);
    }
    private recode(data)
    {
        var a;
        try
        {
            a = JSON.parse(data);
        }
        catch(e)
        {
            a = data;
        }
        return a
    }
}
