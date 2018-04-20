import { Component, OnInit } from '@angular/core';
import { QueryService } from "../lib/query.service";
declare var trace:any;
declare var md5:any;
@Component({
  selector: 'app-enter',
  templateUrl: './enter.component.html',
  styleUrls: ['./enter.component.css'],
  providers: [QueryService]
})
export class EnterComponent
{
    Version = "";
    login = "";
    password = "";
    error = "";
    constructor(private query: QueryService) 
    { 
        query.post(0, {}, (data) => { this.Version = data.main });
    }
    enter()
    {
        this.query.post(9, { paramL: this.login}, (data) =>
        {
            if(data[0] == "yes")
                this.query.post(4, {paramL: this.login, paramI: localStorage.getItem("ID"), param: [md5(this.password)]}, (data) =>
                {
                    if(data[0] != "cced31a3-ebea-4541-841f-271ad5deedb8")
                    {
                        //var time = 0;
                        //if(notRemember.object.checked) time = 0x7fffffff;
                        localStorage.setItem("checkKey", data[0]);
                        localStorage.setItem("login", data[1]);
                        localStorage.setItem("name", data[2]);
                        location.href = "/";
                    }
                    else this.error = "Неверный логин или пароль!";
                });
            else this.error = "Неверный логин или пароль!";
            this.password = "";
        });
    }
    downEnter(event:any)
    {
        if(event.keyCode == 13) this.enter();
    }
}
