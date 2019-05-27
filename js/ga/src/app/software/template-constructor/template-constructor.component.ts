import { Component, OnInit } from '@angular/core';
import { QueryService } from '../../lib/query.service';

declare var trace:any;
@Component({
    selector: 'app-template-constructor',
    templateUrl: './template-constructor.component.html',
    styleUrls: ['./template-constructor.component.css'],
    providers: [ QueryService ]
})
export class TemplateConstructorComponent implements OnInit 
{
    inputData = 
    {
        first: true,
        name: "test", 
        id: -1, 
        type: "node", // type = node / table
        children: [
            { name: "test", id: -1, type: "table",
            children: [
                { name: "test", id: -1, type: "table" },
                { name: "test", id: -1, type: "table" },
                { name: "test", id: -1, type: "table" },
            ] },
            { name: "test", id: -1, type: "table" },
            { name: "test", 
                id: -1, 
                type: "table"
            },
            { name: "test", id: -1, type: "table" },
            { name: "test", 
                id: -1, 
                type: "node", 
                children: [
                    { name: "test", id: -1, type: "table" },
                ]
            },
        ]
    }
    data = [];
    tableData = [];
    constructor()
    {
        this.uncover();
        this.tableData = [];
        let row = 0;
        for(let i = 0; i < this.data.length; i++)
        {
            if(!this.tableData[row]) this.tableData[row] = [];
            this.tableData[row][this.data[i].level] = this.data[i];
            if(this.data[i + 1] 
                && (this.data[i].level == this.data[i + 1].level || this.data[i].level > this.data[i + 1].level)) 
                row++;
        }
    }
    ngOnInit()
    {
    }
    uncover()
    {
        this.data = [];
        let level = 0;
        this.recursionUncover(this.inputData, level);
    }
    recursionUncover(tree, level)
    {
        this.data.push({
            ...tree, 
            level: level
        });
        if(tree.children) 
        {
            for(let i = 0; i < tree.children.length; i++)
                this.recursionUncover(tree.children[i], level + 1);
        }
    }
}