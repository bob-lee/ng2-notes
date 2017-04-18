import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { NoteService } from '../service/note.service';
import { MockNoteService } from '../service/mock-note.service';
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
0! remember group name and my name on local storage
0a! when accessing home page, if it remembers previous group, redirect to that group (how to intercept routing behaviour? navigate in ngOnInit)
0b! when adding a note, if it remembers previous name, prepopulate the name

0! show recent notes first (there is no OrderBy / Filter for ngFor -> pipe)
0a! remove notes array in the component, use notes array in the service
0b! do not mutate notes array, keep it immutable

0! create mock of note service so that it can be played offline
0. dig more about immutable array and change detection, specially in terms of how component detects change on the service 

0! restructure components - our-notes renders either note (notes array), note-form (add or edit)

0. note has optional image - can be taken from Windows file system, mobile gallery, or camera
0! upload image via FormData and save to mongodb (single file only, first save on server file system, then save as binary)
0! get image from mongodb and show on browser (encode binary as bas64, then data URI on '<img src=')
0! upload image and note via FormData
0. save uploaded image to mongodb directly without using server file system
0. save uploaded image as base64

0. try service worker to process image (e.g. downgrading if too big)

0. test
*/

@Component({
  selector: 'app-our-notes',
  templateUrl: './our-notes.component.html',
  styleUrls: ['./our-notes.component.css']
})
export class OurNotesComponent implements OnInit {
  myForm: FormGroup;
  inside: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public noteService: NoteService, // MockNoteService
    private windowRef: WindowRef) { }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      groupName: ['', Validators.required]
    });

    // inspect route
    const group = this.route.snapshot.params['name'];
    const idToEdit = this.route.snapshot.params['id'];
    console.log('\'OurNotesComponent\'', group, idToEdit, this.route.snapshot);
    if (group) { // route has group name
      this.myForm.controls['groupName'].setValue(group);

      if (group === this.noteService.groupName) {
        console.log('group hasn\'t changed');
        this.init(idToEdit);
      } else {
        this.noteService.search(group)
          .subscribe(notes => {
            this.init(idToEdit);
          },
          error => console.error('searchGroup', error),
          () => console.log(`searchGroup Completed!(${this.noteService.notes.length})`)
          );
      }
    } else { // route has no group name
      if (this.windowRef.nativeWindow.localStorage) {
        const previousGroup = this.windowRef.nativeWindow.localStorage.getItem('group');
        if (previousGroup) { // has rememered group name
          console.log('remembered group', previousGroup);
          this.router.navigate(['group', previousGroup]); // redirect to remembered group
          return;
        }
      }

      // exit
      this.noteService.search('');
      this.inside = false;
    }
  }

  searchOrExit() {
    if (this.inside) { // exit
      this.myForm.controls['groupName'].setValue('');
      if (this.windowRef.nativeWindow.localStorage) this.windowRef.nativeWindow.localStorage.setItem('group', ''); // clear group to let, after navigate, ngOnInit find no remembered group and exit

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
    if (this.editing()) {
      console.log('editing');
      return;
    }
    console.log('add');
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'add']);
  }

  edit(noteId) {
    console.log('edit', noteId);
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'edit', noteId]);
  }

  private editing() {
    return this.route.snapshot.url.length === 4 || // editing
      (this.route.snapshot.firstChild && this.route.snapshot.firstChild.url[0].path === 'add'); // adding
  }

  private init(idToEdit) {
    this.inside = true;
    console.log('init', idToEdit);

    if (idToEdit) { // edit
      this.noteService.edit(idToEdit);
    }
  }

}
