import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../../lib/query.service';
declare var trace:any;
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit 
{
    @ViewChild('modal') public modal: any;
    
    height = "";
    functionResize;
    constructor(private query:QueryService) { }
    ngOnInit() 
    {
        this.resize();
        this.functionResize = () => { this.resize(); };
        window.addEventListener("resize", this.functionResize, false);
    }
    resize()
    {
        this.height = document.documentElement.clientHeight - 100 + "px";
    }
    newTask()
    {
        var Data:any = {
            title: "Новая задача",  
            data: [
                ["Название", "", "text"],
                ["Описание", "", "textarea"],
                ["Ответственный", {selected: 0, data: [], value: [] }, "select"],
                ["Наблюдатели", {selected: [], data: [], value: [], current1: null, current2: null}, "choiceListSelect"],
                ["Крайний срок", "", "datetime"],
                ["Без срока", true, "checkbox"]
            ],
            ok: "Сохранить",
            cancel: "Отмена"
        };
        var logins = [];
        var names = [];
        this.query.protectionPost(400, { param: [] }, (data) =>
        {
            for(var key in data)
            {
                logins.push(key);
                if(data[key].familiya != "")
                    names.push(data[key].familiya + " " + data[key].name[0] + "." + data[key].patronymic[0] + ".");
                else names.push(key);
            }
            Data.data[2][1].selected = logins[0];
            Data.data[2][1].data = names;
            Data.data[2][1].value = logins;

            Data.data[3][1].data = names;
            Data.data[3][1].value = logins;
            this.modal.open(Data, (save) =>
            {
                if(save)
                {
                    trace(Data)
                }
            });
        });
    }
    ngOnDestroy() 
    {
        window.removeEventListener("resize", this.functionResize, false);
    }
}
