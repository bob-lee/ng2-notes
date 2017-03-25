import { Pipe, PipeTransform } from '@angular/core';

import { Note } from './service/note.service';

@Pipe({
  name: 'recentFirst'
})
export class RecentFirstPipe implements PipeTransform {
  transform(notes: any[]) {
    console.log('RecentFirstPipe', notes);

    if (!notes) return undefined;
    
    notes.sort((a: Note, b: Note) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      } else if (a.updatedAt > b.updatedAt) {
        return -1;
      } else {
        return 0;
      }
    });
    
    return notes;
  }
}
