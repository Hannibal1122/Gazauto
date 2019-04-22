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
    searchInputType;
    height;
    showPlan(month) //Показать план-график 
    {
      
    }

    addEmployee() //Добавить сотрудника 
    {
      //alert("Добавление");

      var fio = [];
      var Data:any = {
        title: "Добавление сотрудника",  
        data: [
            ["Фамилия сотрудника", fio, "listFio", []]
        ],
        ok: "Изменить",
        cancel: "Отмена"
      };
      this.modal.open(Data, (save) =>
        {
           
        });

    }

}
