import { Ng2NotesPage } from './app.po';

describe('ng2-notes App', () => {
  let page: Ng2NotesPage;

  beforeEach(() => {
    page = new Ng2NotesPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
