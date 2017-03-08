import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  @Input() note: any;
  @Output() event = new EventEmitter();
  noteToEdit: any;
  noteForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.noteForm = this.formBuilder.group({
      name: ['', Validators.required],
      text: ['', Validators.required]
    });

    // this.noteForm.controls['name'].setValue(this.note.name);
    // this.noteForm.controls['text'].setValue(this.note.text);
    this.noteForm.patchValue(this.note);
  }

  save(e) { // saving add or edit, todo = 2 or 1
    console.log('save', this.note._id);
    this.note.name = this.noteForm.value.name;
    this.note.text = this.noteForm.value.text;
    this.event.next(this.note);
    e.stopPropagation();
  }

  cancel(e) { // cancelling add or edit, todo = 2 or 1
    this.note.todo = 0;
    this.event.next(this.note);
    e.stopPropagation();
  }

  remove(e) {
    this.note.todo = 3;
    this.event.next(this.note);
    e.stopPropagation();
  }

}
