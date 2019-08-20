import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
declare var $:any;
declare var trace:any;

@Injectable()
export class QueryService 
{
    private url = environment.URL;
    constructor(private http: HttpClient) 
    { 
        /* $.ajaxSetup({ headers: {  'Access-Control-Allow-Origin': 'http://localhost:8081' } }); */
    }
    post(n, data, func?)
    {
        var dataQuery = {nquery: n};
        for(var key in data) dataQuery[key] = data[key];
        $.post(this.url, dataQuery, (data) =>
        {
            if(func) func(this.recode(data));
        });
    }
    protectionPost(n, data, func?)
    {
        var dataQuery = {nquery: n};
        for(var key in data) dataQuery[key] = data[key];
        dataQuery["paramI"] = localStorage.getItem("ID");
        dataQuery["paramL"] = localStorage.getItem("login");
        dataQuery["paramC"] = localStorage.getItem("checkKey");
        $.post(this.url, dataQuery, (data) =>
        {
            if(func) func(this.recode(data));
        });
    }
    protectionGet(n, data)
    {
        return this.url + "?nquery=" + n + "&paramI=" + localStorage.getItem("ID") + "&paramL=" + localStorage.getItem("login")  + "&paramC=" + localStorage.getItem("checkKey")  + "&param=" + data; 
    }
    uploadFile(n, event, func)
    {
        let fileList: FileList = event.target.files;
        if(fileList.length > 0) {
            let file: File = fileList[0];
            let formData:FormData = new FormData();
            formData.append('filename', file, file.name);
            formData.append("nquery", n);
            formData.append("paramI", localStorage.getItem("ID"));
            formData.append("paramL", localStorage.getItem("login"));
            formData.append("paramC", localStorage.getItem("checkKey"));
            let headers = new HttpHeaders()/* .set('Content-Type', 'multipart/form-data') *//* .set('Accept', 'application/json') */;
            this.http.post(this.url, formData, { headers: headers })
                .subscribe(
                    data => func(data),
                    error => console.log(error)
                )
        }
    }
    private recode(data)
    {
        var a;
        try { a = JSON.parse(data); }
        catch(e) { a = data; }
        return a
    }
    public getWhereUsed(id, func) // Используется при удалении 
    {
        this.protectionPost(131, { param: [id] }, (data) => 
        { 
            let out = "";
            let end = "е";
            if(data > 0) 
            {
                if(data > 1) end = "ах";
                else data = "одном";
                out = `Объект используется в ${data} объект${end}`;
            }
            if(func) func(out);
        });
    }
    public getValueBySrc(src) // Разбить параметры строки
    {
        let a = src.replace("?", "");
        let out = {};
        a = a.split("&");
        for(let i = 0; i < a.length; i++)
        {
            let b = a[i].split("=");
            out[b[0]] = b[1];
        }
        return out;
    }
    public onChange(out) // Общение iframe-ов с главным js через localStorage
    {
        let i = 0;
        // Поиск пустого значения
        while(i < 1000)
        {
            if(!localStorage.getItem("propertyIFrame_" + i)) break;
            i++;
        }
        localStorage.setItem("propertyIFrame_" + i, JSON.stringify(out));
    }
}
