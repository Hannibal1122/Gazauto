import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    @ViewChild("mainContainer") mainContainer:ElementRef;
    @ViewChild("mainTable") mainTable:ElementRef;
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
    outNode:any = {};
    currentNote:any = {};
    constructor()
    {
        this.currentNote = this.inputData;
        this.openCurrentNote(-1);
        /*var getRandom = (min, max) => { return Math.floor(Math.random() * (max - min)) + min; }
        for(let i = 0; i < 400; i++)
        {
            this.dataTable[i] = [];
            for(let j = 0; j < this.header.length; j++)
                this.dataTable[i][j] = { text: ['a123', 'b321', 'v46', 'g45', 'd789', 'e876'][getRandom(0, 6)] }
        }*/
    }
    ngOnInit()
    {
    }
    openCurrentNote(i)
    {
        if(i >= 0) 
        {
            let parent = this.currentNote;
            this.currentNote = this.currentNote.children[i];
            this.currentNote.parent = parent;
        }
        this.outNode = {
            name: this.currentNote.name, 
            id: this.currentNote.id, 
            type: this.currentNote.type,
            children: []
        }
        if(this.currentNote.children)
            for(let i = 0; i < this.currentNote.children.length; i++)
            {
                let child = this.currentNote.children[i];
                this.outNode.children[i] = {
                    name: child.name, 
                    id: child.id, 
                    type: child.type,
                    children: child.children && child.children.length > 0 ? child.children.length : 0
                }
            }
        setTimeout(() =>
        {
            this.drawLine();
        }, 200)
    }
    openParentNode()
    {
        if(this.currentNote.first) return;
        this.currentNote = this.currentNote.parent;
        this.openCurrentNote(-1);
    }
    addNode()
    {
        if(!this.currentNote.children) 
        {
            this.currentNote.children = [];
            this.outNode.children = [];
        }
        this.currentNote.children.push({
            name: "test", 
            id: -1, 
            type: "node"
        });
        this.outNode.children.push({
            name: "test", 
            id: -1, 
            type: "node",
            children: 0
        });
    }
    addTable()
    {
        if(!this.currentNote.children) 
        {
            this.currentNote.children = [];
            this.outNode.children = [];
        }
        this.currentNote.children.push({
            name: "test", 
            id: -1, 
            type: "table"
        });
        this.outNode.children.push({
            name: "test", 
            id: -1, 
            type: "table",
            children: 0
        });
    }
    linePropertyes = {
        lines: [],
        width: 0,
        height: 0,
        top: 0,
        left: 0
    };
    drawLine()
    {
        /* this.lines = []; */
        let rect = this.mainTable.nativeElement.getBoundingClientRect();
        this.linePropertyes.width = rect.width;
        this.linePropertyes.height = rect.height; 
        this.linePropertyes.top = rect.y; 
        this.linePropertyes.left = rect.x; 
        let td = this.mainTable.nativeElement.getElementsByTagName("tr")[0].getElementsByTagName("td");
        let first = td[0].getElementsByTagName("div")[0].getBoundingClientRect();
        let second = td[1].getElementsByTagName("div");
        this.linePropertyes.lines = [];
        for(let i = 0; i < second.length; i++)
        {
            let rectSub = second[i].getBoundingClientRect();
            this.linePropertyes.lines.push({
                x1: (first.x - rect.x) + first.width,
                y1: (first.y - rect.y) + rectSub.height / 2,
                x2: (rectSub.x - rect.x),
                y2: (rectSub.y - rect.y)/*  + rectSub.height / 2 */,
            });
        }

        trace(this.linePropertyes.lines)
    }
    /* header:any = [{ text: "test 1 sdkfjh sdflhas dklfh s"}, { text: "test 2 asdkjfh asf"}, { text: "test 3"}, { text: "test 4"}, { text: "test 5"}, { text: "test 6"}];
    dataTable = [];
    onScroll()
    {
        let th = this.mainContainer.nativeElement.getElementsByTagName("tr")[0].getElementsByTagName("th");
        for(let i = 0; i < th.length; i++)
        {
            let rect = th[i].getBoundingClientRect();
            this.header[i].width = rect.width;
            this.header[i].height = rect.height;
        }
    } */
}