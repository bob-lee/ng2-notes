import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '@angular/material';
import 'hammerjs';

import { AppComponent } from './app.component';
import { OurNotesComponent } from './our-notes/our-notes.component';
import { NoteComponent } from './note/note.component';
import { NoteFormComponent } from './note-form/note-form.component';

import { NoteService } from './service/note.service';
import { MockNoteService } from './service/mock-note.service';
import { WindowRef } from './service/window-ref.service';
import { FocusMeDirective } from './focus-me.directive';
import { RecentFirstPipe } from './recent-first.pipe';
import { AppRoutes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    OurNotesComponent,
    NoteComponent,
    NoteFormComponent,
    FocusMeDirective,
    RecentFirstPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule,
    RouterModule.forRoot(AppRoutes)
  ],
  providers: [
    NoteService,
    MockNoteService,
    WindowRef
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
