import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '@angular/material';
import 'hammerjs';

import { AppComponent } from './app.component';
import { OurNotesComponent } from './our-notes/our-notes.component';
import { GroupComponent } from './group/group.component';
import { NoteComponent } from './note/note.component';

import { NoteService } from './service/note.service';
import { AppRoutes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    OurNotesComponent,
    GroupComponent,
    NoteComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule,
    RouterModule.forRoot(AppRoutes)
  ],
  providers: [
    NoteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
