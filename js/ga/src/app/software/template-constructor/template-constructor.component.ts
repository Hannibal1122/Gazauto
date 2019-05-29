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
    rMain = 50;
    R = 110; // Радиус минимальный
    rNode = 40; // радиус кружков
    currentElement:any = {};
    circles = [];
    parent = 0;
    svgProperties = 
    {
        width: 0
    }
    constructor()
    {
        if(localStorage.getItem("constructor"))
        {
            this.treeDB.load(JSON.parse(localStorage.getItem("constructor")));
        }
        else this.treeDB.push("root", "node", 0);
        this.openParent(1);
    }
    ngOnInit()
    {
    }
    openParent(id)
    {
        this.parent = id;
        this.currentElement = this.treeDB.get(id);
        this.circles = this.treeDB.children(this.parent);
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
    backToParent()
    {
        if(this.currentElement.parent == 0) return;
        this.openParent(this.currentElement.parent);
    }
    appendCircle(type)
    {
        let copyElement;
        if(type == "table") 
        {
            if(!localStorage.getItem("copyExplorer")) return;
            copyElement = JSON.parse(localStorage.getItem("copyExplorer"));
            if(copyElement.objectType == "table")
            {
                this.circles.push({ 
                    type: type, 
                    name: copyElement.name, 
                    id: this.treeDB.push("", type, this.currentElement.id, copyElement.id) 
                });
            }
        }
        else
            this.circles.push({ 
                type: type, 
                name: "", 
                id: this.treeDB.push("", type, this.currentElement.id) 
            });
        this.calcPosition();
    }
    remove(e, i)
    {
        this.treeDB.remove(this.circles[i].id);
        this.circles.splice(i, 1);
        this.calcPosition();
        e.preventDefault();
    }
    saveDB()
    {
        localStorage.setItem("constructor", JSON.stringify(this.treeDB.db));
    }
}
class TreeDataBase
{
    db = {};
    lastId = 1;
    constructor()
    {
    }
    push(name, type, parent, globalId?) // globalId - id из главной базы, для таблиц
    {
        this.db[this.lastId] = { 
            name: name, 
            type: type,
            parent: parent,
            globalId: globalId,
            id: this.lastId
        }
        return this.lastId++;
    }
    remove(id)
    {
        for(let key in this.db)
            if(this.db[key].parent == id) this.remove(this.db[key].id);
        delete this.db[id];
    }
    get(id)
    {
        return this.db[id];
    }
    children(parent)
    {
        let out = [];
        for(let key in this.db)
            if(this.db[key].parent == parent)
                out.push({ children: this.getCountChildren(key), ...this.db[key] });
        return out;
    }
    getCountChildren(parent)
    {
        for(let key in this.db)
            if(this.db[key].parent == parent)
                return true;
        return false;
    }
    load(data)
    {
        this.db = data;
        let max = 0;
        for(let key in this.db)
            if(this.db[key].id > max) max = this.db[key].id;
        this.lastId = max + 1;
    }
}