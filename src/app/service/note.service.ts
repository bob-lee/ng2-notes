import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class NoteService {
  constructor(private http: Http) { }

  search(term: string) {
    return this.http
      .get(`api/notes/${term}`)
      .map((r: Response) => r.json());
  }

  save(note: any) {
    if (note.todo === 1) { // edit
      return this.http
        .put(`api/notes/${note._id}`, note)
        .map((r: Response) => r.json());
    } else if (note.todo === 2) { // add
      return this.http
        .post(`api/notes`, note)
        .map((r: Response) => r.json());
    }
  }
}