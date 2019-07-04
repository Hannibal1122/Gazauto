import Chart from 'chart.js';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
@Component({
    selector: 'app-statistics-editor',
    templateUrl: './statistics-editor.component.html',
    styleUrls: ['./statistics-editor.component.css'],
    providers: [ QueryService ]
})
export class StatisticsEditorComponent implements OnInit 
{
    inputs = { id: -1 }
    colorArray = [
        "#d38dca",
        "#c77373",
        "#9dd165",
        "#7eb2be"
    ]
    charts = [];
    chartsProperty = [];
    axis = 
    {
        x: { id: "", type: "", tableId: "" },
        y: { id: "", type: "", tableId: "" },
        colorI: 0
    }
    openEdit = false;
    constructor(private query:QueryService)
    {
    }
    ngOnInit()
    {
        this.loadAllCharts();
    }
    loadAllCharts()
    {
        this.charts = [];
        this.chartsProperty = [];
        document.getElementById("statisticsContent").innerHTML = "";
        this.query.protectionPost(451, { param: [ "statistic" ] }, (data) =>
        {
            for(let i = 0; i < data.length; i++)
            {
                let axis = data[i];
                this.axis = axis;
                this.addChart();
            }
        });
    }
    setFromCopy(type)
    {
        let data:any = localStorage.getItem("copyForStatistic");
        if(data) data = JSON.parse(data);
        else return;
        this.axis[type].id = Number(data.id);
        this.axis[type].type = data.type;
        this.axis[type].tableId = data.tableId;
    }
    setColor(i)
    {
        this.axis.colorI = i;
    }
    addChart()
    {
        let last = this.axis;
        this.axis = {
            x: { id: "", type: "", tableId: "" },
            y: { id: "", type: "", tableId: "" },
            colorI: 0
        }
        this.query.protectionPost(250, { param: [ last.x.tableId, 0 ] }, (data) =>
        {
            let axisX = [];
            let axisY = [];
            let TableXName = data.name;
            for(let i = 0; i < data.data.length; i++) 
            {
                axisX.push(data.data[i][last.x.id].value);
                if(last.x.tableId == last.y.tableId)
                    axisY.push(Number(data.data[i][last.y.id].value));
            }
            if(last.x.tableId == last.y.tableId)
            {
                this.loadChart(axisX, axisY, this.colorArray[last.colorI ? last.colorI : 0], TableXName);
                this.chartsProperty.push(last);
                this.query.protectionPost(450, { param: [ "statistic", JSON.stringify(this.chartsProperty) ] });
            }
            else
                this.query.protectionPost(250, { param: [ last.y.tableId, 0 ] }, (data) =>
                {
                    for(let i = 0; i < data.data.length; i++) 
                        axisY.push(Number(data.data[i][last.y.id].value));
                    this.loadChart(axisX, axisY, this.colorArray[last.colorI ? last.colorI : 0], TableXName + "/" + data.name);
                    this.chartsProperty.push(last);
                    this.query.protectionPost(450, { param: [ "statistic", JSON.stringify(this.chartsProperty) ] });
                });
            this.cancelEditPanel();
        })
    }
    openEditPanel()
    {
        this.openEdit = true;
    }
    cancelEditPanel()
    {
        this.openEdit = false;
    }
    loadChart(labels, data, color, label)
    {
        let width = 600;
        let height = 400;
        let content = document.getElementById("statisticsContent");
        let div = document.createElement("div");
        div.style.width = width + "px";
        div.style.height = height + "px";
        div.style.position = "relative";
        div.style["margin-top"] = "5px";
        div.style["margin-left"] = "5px";
        div.className = "MainBColor";
        let canvas = document.createElement("canvas");
        canvas.setAttribute("width", String(width));
        canvas.setAttribute("height", String(height));

        /* <div class = "ModalButtonExitColor" style = "position:absolute; right:5px; top:5px; font-size:16px; cursor:pointer;" (click) = "removeSticker(stick.id, i)">
            <i class="fas fa-times-circle"></i>
        </div> */

        let remove = document.createElement("div");
        remove.style.position = "absolute";
        remove.style.top = "5px";
        remove.style.right = "5px";
        remove.style.cursor = "pointer";
        remove.className = "ModalButtonExitColor";
        let iElement = document.createElement("i");
        iElement.className = "fas fa-times-circle";
        remove.appendChild(iElement);
        let i = this.charts.length;
        remove.onclick = () => {
            content.removeChild(this.charts[i]);
            this.charts.splice(i, 1);
            this.chartsProperty.splice(i, 1);
            this.query.protectionPost(450, { param: [ "statistic", JSON.stringify(this.chartsProperty) ] });
        }
        div.appendChild(canvas);
        div.appendChild(remove);
        content.appendChild(div);
        let ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color,
                    borderColor: color,
                    fill: false,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.charts[i] = div;
    }
}