import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { WindowRef } from './window-ref.service';

export interface Note {
  group: string;
  name: string;
  text: string;
  todo: number;
}

@Injectable()
export class NoteService {
  notes: any[]; // put notes here in the service not in component, let component use it
  groupName: string;

  constructor(private http: Http,
    private windowRef: WindowRef) { }

  search(term: string) { // search group by name
    if (term) { // enter group
      this.groupName = term;
      return this.http
        .get(`api/notes/${term}`)
        .map((r: Response) => {
          this.notes = r.json();
          if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('group', term); // remember group
          return this.notes;
        });
    } else { // exit group
      this.notes = []; // empty group
      this.groupName = '';
    }
  }

  save(note: any) {
    if (note.todo === 1) { // edit
      return this.http
        .put(`api/notes/${note._id}`, note)
        .map((r: Response) => {
          const result = r.json();
          this.updateNote(result.note);
          return note;
        });
    } else if (note.todo === 2) { // add
      return this.http
        .post(`api/notes`, note)
        .map((r: Response) => {
          const result = r.json();
          this.addNote(result.note);
          return note;
        });
    } else if (note.todo === 3) { // remove
      return this.http
        .delete(`api/notes/${note._id}`)
        .map((r: Response) => {
          this.removeNote(note.index);
          return r.json();
        });
    }
  }

  private addNote(note: any) {
    this.notes.push(note);
    if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('name', note.name); // remember the name
    console.log(this.notes.length);
  }

  private removeNote(index: number) {
    if (index < 0 || index >= this.notes.length) {
      console.error('removeNote invalid index', index);
      return;
    }
    this.notes.splice(index, 1);
  }

  private updateNote(note: any) { // find note and update it with given one. assumes given one appears in array only once
    for (let i = 0, len = this.notes.length; i < len; i++) {
      if (note._id === this.notes[i]._id) {
        this.notes[i] = note;
        return;
      }
    }
  }
}