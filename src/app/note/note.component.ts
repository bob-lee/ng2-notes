import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { NoteService } from '../service/note.service';
import { MockNoteService } from '../service/mock-note.service';

@Component({
  selector: 'note',
  template: `
  <div *ngFor="let note of (noteService.notes | recentFirst)" (click)="edit(note)" class="notes">
    {{note.name}}, {{note.updatedAt | date : 'dd/MM/yyyy h.mma' | lowercase}}, <br/>
    {{note.text}}
    <hr>
  </div>  
  `,
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {

  constructor(private router: Router,
    public noteService: NoteService) { }

  ngOnInit() {
    console.log('\'NoteComponent\'');
    this.noteService.todo = 0;
  }

  edit(note) {
    this.router.navigate(['group', this.noteService.groupName, 'edit', note._id]);
  }
}
