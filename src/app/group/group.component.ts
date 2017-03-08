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

  edit(note, index) {
    note.todo = 1;
    note.index = index; // provide note component with index
    console.log('edit', note._id, index);
  }

  handle(e) { // handle events (remove, cancel, or save) from note component by seeing e.todo 
    console.log('handle', e);
    if (e.todo === 1) { // edit
      this.noteService.save(e)
        .subscribe(result => {
          console.log('edited', result);
          e.todo = 0; // back to view mode
        });
    } else if (e.todo === 2) { // add
      this.noteService.save(e)
        .subscribe(result => {
          result.note.todo = 0;
          this.notes.push(result.note);
          console.log('added', result);
          this.empty();
        });
    } else if (e.todo === 3) { // remove
      console.log('handle', e);
      this.noteService.save(e)
        .subscribe(result => {
          console.log('removed', result);
          e.todo = 0;
          this.notes.splice(e.index, 1); // slice vs splice, splice doesn't create a new array instance, ngFor change detection in question..
        });
    }
  }
}
