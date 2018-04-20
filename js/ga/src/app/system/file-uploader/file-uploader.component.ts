import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, Input} from '@angular/core';
import { QueryService } from "../../lib/query.service";

declare var trace:any;

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
  providers: [ QueryService ]
})
export class FileUploaderComponent implements OnInit 
{
    @ViewChild('fileForm') public fileForm: ElementRef;
    @ViewChild('fileInput') public fileInput: ElementRef;
    @Output() onChange = new EventEmitter<any>();
    @Output() Load = new EventEmitter<any>();
    @Input() set config(value)
    {
        if(value)
        {
            this.addNQuery = value.add ? value.add : 0;
            this.removeNQuery = value.remove ? value.remove : 0;
            this.maxLoadFile = value.maxLoadFile ? value.maxLoadFile : 0;
        }
    }

    listFile = [];
    addNQuery = 0;
    removeNQuery = 0;
    maxLoadFile = 0; // нету границы
    constructor(private query:QueryService) 
    { 
    }
    ngOnInit() 
    {
        
    }
    Upload()
    {
        var self = this;
        var a:any = document.forms;
        this.fileForm.nativeElement.onsubmit = () => { return false; }
        this.Load.emit({data: 1});
        this.query.uploadFile(this.addNQuery, this.fileForm.nativeElement, (data) =>
        {
            if(data[0] == "OK")
            {
                this.fileInput.nativeElement.value = "";
                this.listFile.push({name: data[1], fullName: data[2]});
                this.onChange.emit(this.listFile);
            }
            this.Load.emit({data: 0, error: data[0] == "OK" ? "" : data[0]});
        });
    }
    removeFromListFile(i)
    {
        this.query.protectionPost(this.removeNQuery, { param: [this.listFile[i].fullName] }, (data) =>
        {
            this.listFile.splice(i, 1);
            this.onChange.emit(this.listFile);
        });
    }
}