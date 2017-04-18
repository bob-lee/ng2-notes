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
  isBase64: boolean; // to inidcate how to handle selected file, false: upload via FormData and save as binary, true: upload and save as base64 string
  base64: string; // to upload base64 encoded image, to download data uri
  img: { data: number[], contentType: string }; // to upload binary image
  imgTo: string // client to set what to do with any existing data on db, '': do nothing or save uploaded image, 'remove': to remove image on db
}

@Injectable()
export class NoteService {
  notes: any[]; // put immutable notes array here in the service, let component use it
  groupName: string;

  private _todo: number = 0; // 0: list, 1: add, 2: edit
  get todo(): number { return this._todo; }
  set todo(todo: number) { this._todo = todo; }

  constructor(private http: Http,
    private windowRef: WindowRef) { }

  edit(idToEdit) {
    let index = this.index(idToEdit);
    if (index === -1) return; // not found

    this.notes[index].todo = 1;
  }

  getNote(id: string): any {
    return this.notes[this.index(id)];
  }

  search(term: string) { // search group by name
    if (term) { // enter group
      this.groupName = term;
      return this.http
        .get(`api/notes/${term}`)
        .map((r: Response) => {
          this.notes = r.json();
          console.log(`got ${this.notes.length} note(s)`);
          if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('group', term); // remember group
          return this.notes;
        });
    } else { // exit group
      this.notes = []; // empty group
      this.groupName = '';
    }
  }

  save(note: any, files, toRemove?: boolean): Observable<any> {
    if (toRemove) { // remove
      return this.http
        .delete(`api/notes/${note._id}`)
        .map((r: Response) => {
          this.removeNote(note);
          return r.json();
        });
    } else if (this._todo === 1) { // add
      console.log('save add', files, note.isBase64);

      if (note.isBase64) { // post data as base64
        return this.makeNote(note, files)
          .flatMap(note => {
            return this.http
              .post(`api/notes`, note)
              .map((r: Response) => {
                this.addNote(r.json());
                return this.notes;
              });
          });
      } else { // post data as binary via FormData
        return this.http
          .post(`api/notes/form`, this.makeFormData(note, files))
          .map((r: Response) => {
            this.addNote(r.json());
            return this.notes;
          });
      }

    } else if (this._todo === 2) { // edit
      if (note.isBase64) { // put data as base64
        return this.makeNote(note, files)
          .flatMap(note => {
            return this.http
              .put(`api/notes/${note._id}`, note)
              .map((r: Response) => {
                this.updateNote(r.json());
                return this.notes;
              });
          });
      } else { // put data as binary via FormData
        return this.http
          .put(`api/notes/form/${note._id}`, this.makeFormData(note, files))
          .map((r: Response) => {
            this.updateNote(r.json());
            return this.notes;
          });
      }
    }
  }

  private addNote(note: any) {
    if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('name', note.name); // remember the name
    //this.notes.push(note);
    this.notes = [...this.notes, note]; // needs to replace it for change detection
  }

  private appendFormData(note: any, formData: FormData, base64?: string): void {
    for (let key in note) {
      if (key === 'base64'/* && note.imgTo !== 'remove'*/) continue; // do not send base64

      formData.append(key, key === 'base64' && base64 ? base64 : note[key]);
    }
  }

  private index(id: string): number {
    let index = -1;
    for (let i = 0, len = this.notes.length; i < len; i++) {
      if (this.notes[i]._id === id) {
        index = i;
        break;
      }
    }
    return index; // -1: not found
  }

  private makeFormData(note: any, files): FormData {
    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      formData.append('optional', file);
    }
    this.appendFormData(note, formData);

    return formData;
  }

  private makeNote(note: any, files): Observable<any> {
    const file = files.length > 0 ? files.item(0) : null;
    console.log('makeNote', note, file);

    if (!file) {
      //console.log('makeNote', note);
      note.base64 = '';
      return Observable.of(note);
    }

    // populate note.base64
    let fileReader = new FileReader();

    let result = Observable.create(observer => {
      fileReader.onload = function (event: any) {
        let base64 = event.target.result; // "data:image/jpeg;base64,/9j/4AAQSk..."
        console.log('makeNote base64', base64.length);
        note.base64 = base64;

        observer.next(note);
        observer.complete();
      }
    });

    fileReader.readAsDataURL(file);

    return result;
  }

  private removeNote(note: any) {
    let index = this.index(note._id);
    if (index === -1) return; // not found

    this.notes = [...this.notes.slice(0, index), ...this.notes.slice(+index + 1)]; // immutability exercise
    //this.notes.splice(index, 1);
  }

  private updateNote(note: any) {
    let index = this.index(note._id);
    if (index === -1) return; // not found

    this.notes = [...this.notes.slice(0, index), note, ...this.notes.slice(+index + 1)]; // immutability exercise
  }
}

