import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { OurNotesComponent } from './our-notes/our-notes.component';
import { GroupComponent } from './group/group.component';

export const AppRoutes: Routes = [
  { path: '', redirectTo: '/group', pathMatch: 'full' },
  { path: 'group', component: OurNotesComponent, 
    /*children: [
      { path: 'group/:name', component: GroupComponent } 
    ]*/
  },
  { path: 'group/:name', component: OurNotesComponent }
  // { path: 'group/:name', component: GroupComponent, 
  //   children: [
  //     { path: 'add', component: AddNoteComponent },
  //     { path: 'edit/:id', component: EditNoteComponent } 
  //   ]
  // }
];