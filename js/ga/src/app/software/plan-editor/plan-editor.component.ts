import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
@Component({
  selector: 'app-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.css']
})
export class PlanEditorComponent implements OnInit 
{
  @ViewChild('editPlan') public editPlan: any;

    id: number;
    fio: string;
    //employees: Employee[] = [];
    inputs = { id: -1, searchObjectId: -1 };
    dataPlan = [];


    constructor(public query: QueryService) { }
    ngOnInit() 
    {
      
    }

    showPlan() //Показать план-график 
    {

    }

    addEmployee() //Добавить сотрудника 
    {
      let l = this.dataPlan.length;
      this.update({ type: "row", idRow: l > 0 ? this.dataPlan[l - 1].__ID__ : -1, idNextRow: -1 });
    }

    update(property)
    {
       
    }
}
