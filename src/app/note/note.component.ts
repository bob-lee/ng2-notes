import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'note',
  template:`
  <div [hidden]="note && note.todo !== undefined">
    {{note.todo}}
    {{note.name}}, {{note.updatedAt | date : 'dd/MM/yyyy h.mma' | lowercase}}, {{note.text}}
  </div>

  <div *ngIf="note && note.todo !== undefined">
    <note-form [noteToEdit]="note"></note-form>
  </div>
  `,
  //templateUrl: './note.component.html', // (event)="handle($event)"
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  @Input() note: any;

  constructor() { }

  ngOnInit() { }

}
