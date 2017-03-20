import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { NoteService } from '../service/note.service';
import { WindowRef } from '../service/window-ref.service';


/*
0! handle 'add' by child route of OurNotesComponent as a nested view 
0! handle 'edit' by child route of OurNotesComponent as a nested view 
0! relocate GroupComponent stuff into OurNotesComponent and remove it
0! allow only one note-form at once
1! mandatory fields - name and text
3! show validation error (required)
2! show group name inside the group
0! when saving with no change, do the same navigation without making server call
0! when entering edit mode, do not make server call if group name hasn't changed
4! after successful add, content remains in the add form

0! auto focus
0. show recent notes first (there is no OrderBy / Filter for ngFor)
0. remember group name and my name on local storage
0a! when accessing home page, if it remembers previous group, redirect to that group (how to intercept routing behaviour? navigate in ngOnInit)
0b! when adding a note, if it remembers previous name, prepopulate the name
*/

@Component({
  selector: 'app-our-notes',
  templateUrl: './our-notes.component.html',
  styleUrls: ['./our-notes.component.css']
})
export class OurNotesComponent implements OnInit {
  myForm: FormGroup;
  inside: boolean = false;
  notes: any;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private windowRef: WindowRef) { }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      groupName: ['', Validators.required]
    });

    const gName = this.route.snapshot.params['name'];
    const indexToEdit = this.route.snapshot.params['index'];
    console.log('ngOnInit', gName, indexToEdit, this.route.snapshot);
    if (gName) {
      this.myForm.controls['groupName'].setValue(gName);

      if (gName === this.noteService.groupName) {
        console.log('group hasn\'t changed');
        this.init(indexToEdit);
      } else {
        this.noteService.search(gName)
          .subscribe(notes => {
            this.init(indexToEdit);
          },
          error => console.error('searchGroup', error),
          () => console.log(`searchGroup Completed!(${this.noteService.notes.length})`)
          );
      }
    } else { // empty name
      if (this.windowRef.nativeWindow.localStorage) {
        const previousGroup = this.windowRef.nativeWindow.localStorage.getItem('group');
        if (previousGroup) {
          console.log('remembered group', previousGroup);
          this.router.navigate(['group', previousGroup]); // redirect to remembered group
          return;
        }
      }

      this.noteService.search('');
      this.inside = false;
    }
  }

  searchOrExit() {
    if (this.inside) { // exit
      this.myForm.controls['groupName'].setValue('');
      if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('group', ''); // clear group

      this.inside = false;
      this.router.navigate(['']);
    } else { // search
      if (this.myForm.controls['groupName'].value) {
        this.inside = true;
        this.router.navigate(['group', this.myForm.controls['groupName'].value]);
      }
    }
  }

  add() {
    console.log('add'/*, this.route.snapshot*/);
    if (this.editing()) {
      console.log('editing');
      return;
    }
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'add']);
  }

  edit(note, index) {
    console.log('edit', note._id, index/*, this.route.snapshot*/);
    if (this.editing()) {
      console.log('editing');
      return;
    }
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'edit', index]);
  }

  private editing() {
    return this.route.snapshot.url.length === 4 || // editing
      this.route.snapshot.firstChild; // adding, firstChild.url[0].path === 'add'
  }

  private init(indexToEdit) {
    this.notes = this.noteService.notes;
    this.inside = true;
    console.log(this.notes, indexToEdit);

    if (indexToEdit) { // edit
      this.notes[indexToEdit].todo = 1;
      this.notes[indexToEdit].index = indexToEdit; // provide note component with index
    }
  }

}
