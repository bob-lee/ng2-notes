import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { Note } from '../app.component';
import { NoteService } from '../service/note.service';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groupName: string;
  notes: any[];
  noteToAdd: Note;
  noteEmpty: Note;
  @Output() inside = new EventEmitter();

  constructor(private noteService: NoteService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.groupName = this.route.snapshot.params['name'];
    this.empty();

    if (this.groupName) {
      this.inside.next(true);
      this.noteService.search(this.groupName)
        .subscribe(
        notes => {
          this.notes = notes;
          this.notes.forEach(element => { // add 'todo' property to each note (0: view, 1: edit, 2: add, 3: remove)
            element.todo = 0;
          });
          console.log(this.notes);
        },
        error => console.error('searchGroup', error),
        () => console.log(`searchGroup Completed!(${this.notes.length})`)
        );
    } else { // empty name
      this.inside.next(false);
      this.notes = [];
    }
  }

  add() {
    this.empty();
    this.noteToAdd.todo = 2;
  }

  empty() {
    this.noteToAdd = {
      group: this.groupName,
      name: '',
      text: '',
      todo: -1
    };
  }

  edit(note) {
    note.todo = 1;
    console.log('edit', note._id);
  }

  handle(e) {
    console.log('handle', e);
    if (e.todo === 1) { // edit
      this.noteService.save(e)
        .subscribe(result => {
          console.log('edited', result);
          e.todo = 0;
        });
    } else if (e.todo === 2) { // add
      this.noteService.save(e)
        .subscribe(result => {
          console.log('added', result);
          result.todo = 0;
          this.notes.push(result.note);
          this.ref.markForCheck();
          this.empty();
        });
    }
  }
}
