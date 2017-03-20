import { Component, OnInit, Input, Output } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { Note, NoteService } from '../service/note.service';
import { WindowRef } from '../service/window-ref.service';

@Component({
  selector: 'note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit {
  @Input() noteToEdit: any;
  note: Note;
  noteForm: FormGroup;
  submitted: boolean;
  /* 
  note that it does not subscribe to value changes of this form.
  on button click, form value is checked and then manually taken to model.
  */

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private noteService: NoteService,
    private windowRef: WindowRef) { }

  ngOnInit() {
    this.noteForm = this.formBuilder.group({
      name: ['', Validators.required],
      text: ['', Validators.required]
    });

    if (this.noteToEdit) { // edit
      this.note = this.noteToEdit;
    } else { // add
      const previousName = this.windowRef.nativeWindow.localStorage.getItem('name');

      this.note = {
        group: this.noteService.groupName,
        name: previousName ? previousName : '',
        text: '',
        todo: 2
      };
    }

    this.noteForm.patchValue(this.note);

    this.submitted = false;
  }

  save(e) { // add or edit
    e.stopPropagation();
    console.log('save', this.noteForm.status);
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

  cancel(e) {
    e.stopPropagation();
    this.noteForm.patchValue(this.note); // restore original
    this.note.todo = undefined;
    console.log('cancel');
    this.goBack();
  }

  remove(e) {
    e.stopPropagation();
    this.note.todo = 3;
    this.saveNote();
  }

  // see(e) {
  //   e.stopPropagation();
  //   console.log('see', this.noteForm);
  // }

  private changed() { // compare form value and this.note
    if (this.note.todo === 2) return true; // add, changed of course
    const orig = this.note;
    const form = this.noteForm.value;
    const changed = form.name !== orig.name || form.text !== orig.text;
    return changed;
  }

  private goBack() {
    this.router.navigate(['group', this.noteService.groupName]);
  }

  private saveNote() { // assumes this.note has form value
    this.noteService.save(this.note)
      .subscribe(result => {
        console.log('saved', result);
        this.goBack();
      });
  }
}
