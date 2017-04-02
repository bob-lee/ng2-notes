import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { WindowRef } from './window-ref.service';

export interface Note {
  group: string;
  name: string;
  text: string;
  todo: number;
  updatedAt: string; // for sorting
}

@Injectable()
export class NoteService {
  notes: any[]; // put notes here in the service not in component, let component use it // ? do not mutate for change detection
  groupName: string;

  constructor(private http: Http,
    private windowRef: WindowRef) { }

  edit(idToEdit) {
    let index = this.index(idToEdit);
    if (index === -1) return; // not found

    this.notes[index].todo = 1;
  }

  search(term: string) { // search group by name
    if (term) { // enter group
      this.groupName = term;
      return this.http
        .get(`api/notes/${term}`)
        .map((r: Response) => {
          this.notes = r.json();
          console.log('search', this.notes);
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
          return this.notes;
        });
    } else if (note.todo === 2) { // add
      return this.http
        .post(`api/notes`, note)
        .map((r: Response) => {
          const result = r.json();
          this.addNote(result.note);
          return this.notes;
        });
    } else if (note.todo === 3) { // remove
      return this.http
        .delete(`api/notes/${note._id}`)
        .map((r: Response) => {
          this.removeNote(note);
          return r.json();
        });
    }
  }

  private addNote(note: any) {
    if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('name', note.name); // remember the name
    //this.notes.push(note);
    this.notes = [...this.notes, note]; // needs to replace it for change detection
  }

  private removeNote(note: any) {
    let index = this.index(note._id);
    if (index === -1) return; // not found

    this.notes = [...this.notes.slice(0, index), ...this.notes.slice(+index + 1)]; // immutability exercise
    //this.notes.splice(index, 1);
  }

  private updateNote(note: any) { // find note and update it with given one. assumes given one appears in array only once
    /* mutate item
    for (let i = 0, len = this.notes.length; i < len; i++) {
      if (note._id === this.notes[i]._id) {
        this.notes[i] = note;
        return;
      }
    }
    */
    let index = this.index(note._id);
    if (index === -1) return; // not found
    
    this.notes = [...this.notes.slice(0, index), note, ...this.notes.slice(+index + 1)]; // immutability exercise
  }

  private index(id: number) {
    let index = -1;
    for (let i = 0, len = this.notes.length; i < len; i++) {
      if (this.notes[i]._id === id) {
        index = i;
        break;
      }
    }
    return index; // -1: not found
  }

}

