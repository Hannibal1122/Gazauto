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
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].id == id) 
            {
                this.data.splice(i, 1);
                break;
            }
    }
    getRecursionRemove(out, parent, level)
    {
        out.push({ ...parent, level: level });
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id) this.getRecursion(out, this.data[i], level + 1);
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
        out.push({ ...parent, level: level });
        for(let i = 1; i < this.data.length; i++) 
            if(this.data[i].parent == parent.id) this.getRecursion(out, this.data[i], level + 1);
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