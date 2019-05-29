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
    treeDB: TreeDataBase = new TreeDataBase();
    R = 100; // Радиус минимальный
    rNode = 40; // радиус кружков
    currentElement = {
        id: 0,
        name: "root",
        type: "node",
        x: 0,
        y: 0
    };
    circles = [];
    parent = 0;
    svgProperties = 
    {
        width: 0
    }
    constructor()
    {
        this.openParent(0);
    }
    ngOnInit()
    {
    }
    openParent(parent)
    {
        this.parent = parent;
        this.calcPosition();
    }
    getRandom(min, max)
    { 
        return Math.floor(Math.random() * (max - min)) + min; 
    }
    calcPosition()
    {
        let count = this.circles.length;
        let orbit = [];
        let oI = 0;
        // Должны разобрать по орбитам
        let R = this.R;
        let length;
        while(count > 0)
        {
            orbit[oI] = [];
            length = Math.PI * R * 2;
            let c = length / this.R;
            for(let i = 0; i < c; i++)
            {
                if(count == 0) break;
                orbit[oI].push(this.circles[count - 1])
                count--;
            }
            oI++;
            R = this.R + (oI * (this.rNode * 2 + 5));
        }
        let D = (R + this.rNode) * 2;
        for(let i = 0; i < orbit.length; i++)
        {
            R = this.R + (i * (this.rNode * 2 + 5));
            let alpha = (360 / orbit[i].length) * (Math.PI / 180);
            let a = this.getRandom(0, 180);
            for(let j = 0; j < orbit[i].length; j++)
            {
                orbit[i][j].x = (D / 2) + R * Math.cos(a);
                orbit[i][j].y = (D / 2) + R * Math.sin(a);
                a += alpha;
            }
        }
        this.svgProperties.width = D;
        this.currentElement.x = this.currentElement.y = D / 2;
    }
    appendCircle(type)
    {
        this.circles.push({ type: type, text: "" });
        this.calcPosition();
    }
    remove(e, i)
    {
        this.circles.splice(i, 1);
        this.calcPosition();
        e.preventDefault();
    }
}
class TreeDataBase
{
    db = {};
    lastId = 1;
    constructor()
    {
    }
    push(name, type, parent)
    {
        this.db[this.lastId] = { 
            name: name, 
            type: type,
            parent: parent
        }
        this.lastId++;
    }
    remove(id)
    {
        delete this.db[id];
    }
    get(id)
    {
        return this.db[id];
    }
    children(parent)
    {
        let out = [];
        for(let id in this.db)
            if(this.db[id].parent == parent)
                out.push({ id: id, ...this.db[id] });
        return out;
    }
    load(data)
    {
        // Надо вычислить и выставить lastId
    }
}