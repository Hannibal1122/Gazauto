import { Injectable } from '@angular/core';
@Injectable()
export class MyTree
{
    data = [];
    constructor()
    {
    }
    push(parent, data)
    {
        this.data.push({ id: this.getId(), parent: parent, ...data });
    }
    remove(id)
    {
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].id == id) 
            {
                this.data.splice(i, 1);
                break;
            }
    }
    getChildren(out, parent, recursion?)
    {
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id)
            {
                out.push(this.data[i]);
                if(recursion) this.getChildren(out, this.data[i]);
            }
    }
    getRecursionRemove(out, parent)
    {
        out.push(parent.id);
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id)
                this.getRecursionRemove(out, this.data[i]);
    }
    getCountChildren(parent)
    {
        let l = 0;
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].parent == parent) l++;
        return l;
    }
    straighten()
    {
        let out = [];
        this.getRecursion(out, this.data[0], 0); // Первый элемент всегда корневой, поэтому не надо искать минимальный id
        return out;
    }
    getRecursion(out, parent, level)
    {
        if(parent === undefined) return;
        let elem = { end: true, open: level == 0, hide: level > 1, ...parent, level: level };
        out.push(elem);
        for(let i = 0; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id) 
            {
                elem.end = false;
                this.getRecursion(out, this.data[i], level + 1);
            }
    }
    getElement(id)
    {
        for(let i = 0; i < this.data.length; i++)
            if(this.data[i].id == id) return this.data[i];
    }
    getId()
    {
        let max = 0;
        for(let i = 0; i < this.data.length; i++)
            if(this.data[i].id > max) max = this.data[i].id;
        return max + 1;
    }
}