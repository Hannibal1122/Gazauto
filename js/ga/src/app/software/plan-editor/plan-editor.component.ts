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
  proba=0;

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

    addEmployee() //Добавить сотрудника 
    {
      var fio = [];
      for(var i = 0; i < this.employees.length; i++) fio[i] = { id: this.employees[i].tabelnom, value: this.employees[i].surname };
      var Data:any = {
        title: "Добавление сотрудника",  
        data: [
          ["Сотрудник", fio[0].id, "select", fio],
          ["От", "", "datetime"],
          ["До", "", "datetime"],
          ["Значение", "", "text"]
        ],
        ok: "Изменить",
        cancel: "Отмена"
      };

      this.modal.open(Data, (save) =>
        {
           
        });

    }

}
