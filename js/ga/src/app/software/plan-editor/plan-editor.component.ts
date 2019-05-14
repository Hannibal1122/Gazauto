import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';
//import { employees } from '../../employees';
import { EMPLOYEES} from '../../list-employees';

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

  employees = EMPLOYEES; //массив с данными о сотрудниках и их днях работы

  month: string;
  coldays: number;

  inputs = { id: -1, searchObjectId: -1 };
  dataPlan = [];


    constructor(public query: QueryService) { }
    ngOnInit() 
    {

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
      for(var i = 0; i < this.employees.length; i++) 
      { 
        fio[i] = this.employees[i].surname+' '+this.employees[i].name+' '+this.employees[i].patronymic;
        fioId[i] = this.employees[i].tabelnom;
      }

      for(var i = 0; i < this.employees.length; i++) 
        { 
          for(var j = 0; j < this.employees[i].days.length; j++)
          {
            today[i][j] = this.employees[i].days[j].colspan;
            dayvalue[i][j] = this.employees[i].days[j].value;
          }
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
        trace(Data.data[0][1].selected) // id Сотрудника
        trace(Data.data[1][1]) // От (миллисекунды)
        trace(Data.data[2][1]) // До (миллисекунды)
        trace(Data.data[3][1]) // Значение

        if(save == true)
        {
          for(var i = 0; i < today.length; i++)
          {
            for(var j = 0; j < today[i]; j++)
            {
              today[i][j] = (Data.data[2][1] - Data.data[1][1])/(1000*3600*24); //делим на кол-во миллисекунд в сутках, чтобы определить кол-во дней
              this.employees[i].days[j].colspan = today[i][j]; 
              dayvalue[i][j] = Data.data[3][1];  
              this.employees[i].days[j].value = dayvalue[i][j]; //присваиваем новое значение, введенное в всплывающем окне

            }
          }
        };

      });

      

    }

}
