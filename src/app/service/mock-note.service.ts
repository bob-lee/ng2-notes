import { Injectable } from '@angular/core';
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
export class MockNoteService {

  /* 'notes' array, try below in this mock-notes.service:
  1. keep notes immutable, do not mutate it
  2. see how component goes with this immutable service
  3. compare with this note.service
  4. what pro and cons here?
  5. is there a possibility to adopt Redux?
  */
  notes: any[]; // put notes here in the service not in component, let component use it // ? do not mutate for change detection

  db: any[]; // may not need this.. work directly with 'notes'?
  groupName: string;

  private _todo: number = 0; // 0: list, 1: add, 2: edit
  get todo(): number { return this._todo; }
  set todo(todo: number) { this._todo = todo; }

  constructor(/*private http: Http,*/
    private windowRef: WindowRef) {

    // initialise the db
    this.db = [
      {
        __v: 0,
        _id: "58a27d5917ef8f356c77c369",
        createdAt: "2017-02-14T03:45:29.209Z",
        group: "Lee family",
        name: "Bob",
        text: "#1 Tue 04.45pm",
        updatedAt: "2017-02-14T03:45:29.209Z"
      },
      {
        __v: 0,
        _id: "58d63e2bf8a8c02ec43d33c4",
        createdAt: "2017-03-25T09:53:47.655Z",
        group: "Lee family",
        name: "Bob2",
        text: "#2",
        updatedAt: "2017-03-25T09:58:21.527Z"
      },
      {
        __v: 0,
        _id: "58d73eb63af56f27e48d693e",
        createdAt: "2017-03-26T04:08:22.158Z",
        group: "Lee family",
        name: "Bob2",
        text: "#3",
        updatedAt: "2017-03-26T04:08:22.158Z"
      },
      {
        __v: 0,
        _id: "58d73eb63af56f27e48d693d",
        createdAt: "2017-03-26T04:09:22.158Z",
        group: "Lee family",
        name: "Bob2",
        text: "#4",
        updatedAt: "2017-03-26T04:09:22.158Z"
      }
    ];

  }

  edit(idToEdit) {
    let index = this.index(idToEdit);
    if (index === -1) return; // not found

    this.notes[index].todo = 1;
  }

  getNote(id: string): any {
    return this.db[this.index(id)];
  }

  search(term: string) { // search group by name
    if (term) { // enter group
      this.groupName = term;
      this.notes = this.db;
      //return Observable.from(this.notesOffline); // 'from' worked as well but emits each item whereas 'create/next' emits the whole array at once
      return Observable.create(observer => {
        observer.next(this.notes);
        observer.complete();

        // Any cleanup logic might go here
        return () => console.log('Observable disposed')
      });
    } else { // exit group
      this.notes = []; // empty group
      this.groupName = '';
    }
  }

  save(note: any, toRemove?: boolean) {
    if (toRemove) {
      this.removeNote(note);
    } else {
      if (this._todo === 1) this.addNote(note);
      else this.updateNote(note);
    }

    return Observable.from([note]);
  }

  private addNote(note: any) {
    if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('name', note.name); // remember the name
    note.updatedAt = new Date().toString();
    note._id = new Date().toString();
    note.todo = undefined; // mock
    this.db.push(note);
    this.notes = [...this.db]; // needs to replace it for change detection
  }

  private removeNote(note: any) {
    let index = this.index(note._id);
    if (index === -1) return; // not found

    /* why slice(n) doesn't work for object array? 
      supposed to return later part of original but actually returning empty array

      slice(n) works
      slice(n + 1) doesn't work..!? n + 1 seems to result in string "n1"
      slice(+n + 1) does work!
    */

    // this.notes = [...this.notes.slice(0, index), ...this.notes.slice(+index + 1)]; // immutability exercise
    this.db.splice(index, 1);
    this.notes = [...this.db];
  }

  private updateNote(note: any) { // find note and update it with given one. assumes given one appears in array only once
    let index = this.index(note._id);
    if (index === -1) return; // not found

    note.todo = undefined;
    this.db[index] = note;
    this.notes = [...this.db];
  }

  private index(id: string): number {
    let index = -1;
    for (let i = 0, len = this.db.length; i < len; i++) {
      if (this.db[i]._id === id) {
        index = i;
        break;
      }
    }
    return index; // -1: not found
  }

}
