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
       /* if (month == "jan" || "mar" || "may" || "jul" || "aug" || "oct" || "dec")
        {
            this.coldays = 31;
        }
        if (month == "apr" || "jun" || "sep" || "nov")
        {
            this.coldays = 30;
        }
        if( month == "feb")
        {
            this.coldays = 28;
        }
        if( month == "all")
        {

        }
        */
    }

    addEmployee() //Добавить сотрудника 
    {
      let l = this.employees;
      
      //this.update({ type: "row", idRow: l > 0 ? this.dataPlan[l - 1].__ID__ : -1, idNextRow: -1 });
    }

    update(property)
    {
       
    }
}
