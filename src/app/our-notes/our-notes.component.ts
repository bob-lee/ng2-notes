import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { NoteService } from '../service/note.service';

/*
0! handle 'add' by child route of OurNotesComponent as a nested view 
0. handle 'edit' by child route of OurNotesComponent as a nested view 
0! relocate GroupComponent stuff into OurNotesComponent and remove it
0. allow only one note-form at once
1! mandatory fields - name and text
3. show validation error (required)
2! show group name inside the group
0! when saving with no change, do the same navigation without making server call
4! after successful add, content remains in the add form
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
    private noteService: NoteService) {
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      groupName: ['', Validators.required]
    });

    const gName = this.route.snapshot.params['name'];
    const indexToEdit = this.route.snapshot.params['index'];
    console.log('ngOnInit', gName, indexToEdit);
    if (gName) {
      this.myForm.controls['groupName'].setValue(gName);

      this.noteService.search(gName)
        .subscribe(notes => {
          this.notes = notes;
          this.inside = true;
          console.log(this.notes);

          if (indexToEdit) { // edit
            this.notes[indexToEdit].todo = 1;
            this.notes[indexToEdit].index = indexToEdit; // provide note component with index
          }
        },
        error => console.error('searchGroup', error),
        () => console.log(`searchGroup Completed!(${this.noteService.notes.length})`)
        );

    } else { // empty name
      this.noteService.search('');
      this.inside = false;
    }
  }

  searchOrExit() {
    if (this.inside) { // exit
      this.myForm.controls['groupName'].setValue('');
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
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'add']);
  }

  edit(note, index) {
    console.log('edit', note._id, index);
    this.router.navigate(['group', this.myForm.controls['groupName'].value, 'edit', index]);
  }

}
