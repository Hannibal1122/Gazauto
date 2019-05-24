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
    @ViewChild('editPlan') public editPlan: any;

    employees = [{ //массив с данными о сотрудниках и их днях работы
        surname: 'Петров', 
        name: 'Петр', 
        patronymic: 'Петрович', 
        days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых'] 
        }, { 
            surname: 'Иванов', 
            name: 'Иван', 
            patronymic: 'Иванович', 
            days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых'] 
        }, { 
            surname: 'Павлов', 
            name: 'Павел', 
            patronymic: 'Павлович', 
            days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых'] 
        }, { 
            surname: 'Александров', 
            name: 'Александр', 
            patronymic: 'Александрович', 
            days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых'] 
        }, { 
            surname: 'Егоров', 
            name: 'Егор', 
            patronymic: 'Егорович', 
            days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых']
        }, { 
            surname: 'Скворцов', 
            name: 'Егор', 
            patronymic: 'Егорович', 
            days: [ 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых', 8, 8, 8, 8, 8, 'Вых', 'Вых']
    }];
    outEmployees = [];

    month: string;
    coldays: number;

    inputs = { id: -1, searchObjectId: -1 };
    dataPlan = [];

    constructor(public query: QueryService) { }
    ngOnInit() 
    {
        this.convertEmployees();
    }
    convertEmployees()
    {
        this.outEmployees = [];
        for(let i = 0; i < this.employees.length; i++)
        {
            this.outEmployees[i] = {
                name: this.employees[i].surname + " " + this.employees[i].surname + " " + this.employees[i].patronymic,
                days: []
            }
            let newLiteral = false;
            let day;
            let lastI;
            for(let j = 0; j < this.employees[i].days.length; j++)
            {
                day = this.employees[i].days[j];
                if(day == "К" || day == "Вых" || day == "От")
                {
                    if(!newLiteral)
                    {
                        lastI = this.outEmployees[i].days.length;
                        this.outEmployees[i].days[lastI] = { 
                            value: day, 
                            colspan: 0
                        };
                    }
                    this.outEmployees[i].days[lastI].colspan++;
                    newLiteral = true;
                }
                else this.outEmployees[i].days.push({ 
                    value: day, 
                    colspan: 1 
                });
                newLiteral = false;
            }
        }
    }
    showPlan(month) //Показать план-график 
    {
      
    }
    editEmployee() //Добавить сотрудника 
    {
      //var currentDate = new Date();
        var today = [];
        var dayvalue = [];
        
        var fio = [];
        var fioId = [];
        for(var i = 0; i < this.outEmployees.length; i++) 
        { 
            fio[i] = this.outEmployees[i].name;
            fioId[i] = i;
        }
        var Data:any = {
            title: "Добавление сотрудника",  
            data: [
            ["Сотрудник", { selected: fio[0].id, data: fio, value: fioId }, "select"],
            ["От", "", "datetime", null, { time: false }],
            ["До", "", "datetime", null, { time: false }],
            ["Значение", "", "text"]
            ],
            ok: "Изменить",
            cancel: "Отмена"
        };

        this.modal.open(Data, (save) =>
        {
            /* trace(Data.data[0][1].selected) // id Сотрудника
            trace(Data.data[1][1]) // От (миллисекунды)
            trace(Data.data[2][1]) // До (миллисекунды)
            trace(Data.data[3][1]) // Значение */
            if(save == true)
            {
                let from = new Date(Data.data[1][1]).getDate() - 1;
                let to = new Date(Data.data[2][1]).getDate();
                let i = Number(Data.data[0][1].selected);
                for(let j = from; j < to; j++)
                    this.employees[i].days[j] = Data.data[3][1];
                this.convertEmployees();
                /* trace(this.employees)
                trace(Data.data[0][1].selected)
                trace(from)
                trace(to) */
            };
        });
    }
}