import { Component, OnInit, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { Note, NoteService } from '../service/note.service';
import { MockNoteService } from '../service/mock-note.service';
import { WindowRef } from '../service/window-ref.service';

@Component({
  selector: 'note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit {
  @ViewChild('fileInput') inputEl: ElementRef;
  note: Note;
  noteForm: FormGroup;
  submitted: boolean;
  _fileChanged: boolean;
  /* 
  note that it does not subscribe to value changes of this form.
  on button click, form value is checked and then manually taken to model.
  */

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private windowRef: WindowRef) { }

  ngOnInit() {
    this.noteForm = this.formBuilder.group({
      name: ['', Validators.required],
      text: ['', Validators.required]
    });
    this._fileChanged = false;

    // inspect route
    const addOrEdit = this.route.snapshot.url.length === 1;
    const idToEdit = this.route.snapshot.params['id'];
    console.log('\'NoteFormComponent\'', addOrEdit ? 'adding' : 'editing', idToEdit, this.route.snapshot);

    if (addOrEdit) { // add
      const previousName = this.windowRef.nativeWindow.localStorage.getItem('name');

      this.note = {
        group: this.noteService.groupName,
        name: previousName ? previousName : '',
        text: '',
        todo: 2,
        updatedAt: '',
        img: undefined,
        dataUri: ''
      };
    } else { // edit
      this.note = this.noteService.getNote(idToEdit);
    }

    this.noteService.todo = addOrEdit ? 1 : 2;

    this.noteForm.patchValue(this.note);

    this.submitted = false;
  }

  cancel(e) {
    e.stopPropagation();
    this.noteForm.patchValue(this.note); // restore original
    this.note.todo = undefined;
    console.log('cancel');
    this.goBack();
  }

  fileChanged() {
    this._fileChanged = true;
  }

  remove(e) {
    e.stopPropagation();
    this.note.todo = 3;
    this.saveNote(true);
  }

  removeFile(e) {
    console.log('removeFile', this.inputEl);
    this.inputEl.nativeElement.value = '';
    this.note.dataUri = '';
    this.fileChanged();
  }

  save(e) { // add or edit
    e.stopPropagation();
    console.log('save', this.noteForm.status, this.changed());
    if (this.noteForm.invalid) {
      this.submitted = true;
      return;
    }

    if (this.changed()) {
      // take form value to model
      this.note.name = this.noteForm.value.name;
      this.note.text = this.noteForm.value.text;

      this.saveNote();
    } else { // no change, go back without making server call
      this.note.todo = undefined;
      this.goBack();
    }
  }

  private changed() { // compare form value and this.note
    if (this.note.todo === 2) return true; // add, changed of course
    const orig = this.note;
    const form = this.noteForm.value;
    const changed = form.name !== orig.name || form.text !== orig.text || this._fileChanged;
    return changed;
  }

  private goBack() {
    this.router.navigate(['group', this.noteService.groupName]);
  }

  private saveNote(toRemove?: boolean) { // assumes this.note has form value
    let inputEl: HTMLInputElement = this.inputEl.nativeElement;
    
    this.noteService.save2(this.note, inputEl.files, toRemove)
      .subscribe(result => {
        console.log('saved', result);
        this.goBack();
      });
  }
}
