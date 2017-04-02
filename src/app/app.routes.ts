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
  { path: 'group/:name/edit/:id', component: OurNotesComponent } // 'group/Lee%20family/edit/58d73eb63af56f27e48d693d'
];