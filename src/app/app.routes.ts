import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { OurNotesComponent } from './our-notes/our-notes.component';
import { NoteFormComponent } from './note-form/note-form.component';

export const AppRoutes: Routes = [
  { path: '', redirectTo: '/group', pathMatch: 'full' },
  { path: 'group', component: OurNotesComponent },
  {
    path: 'group/:name', component: OurNotesComponent,
    children: [
      { path: 'add', component: NoteFormComponent } // 'group/Lee%20family/add'
    ]
  },
  { path: 'group/:name/edit/:index', component: OurNotesComponent } // 'group/Lee%20family/edit/5'
];