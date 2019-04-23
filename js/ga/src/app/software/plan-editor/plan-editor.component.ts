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
      var fioId = [];
        for(var i = 0; i < this.employees.length; i++) 
        {
          fio[i] = this.employees[i].surname+' '+this.employees[i].name+' '+this.employees[i].patronymic;
          fioId[i] = this.employees[i].tabelnom;
        }
        var Data:any = {
          title: "Добавление сотрудника",  
          data: [
              ["Сотрудник", { selected: fio[0].id, data: fio, value: fioId }, "select"],
              ["От", "", "datetime"],
              ["До", "", "datetime"],
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
      });

    }

}
