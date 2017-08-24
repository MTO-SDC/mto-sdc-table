import { SdcTablePage } from './app.po';

describe('sdc-table App', () => {
  let page: SdcTablePage;

  beforeEach(() => {
    page = new SdcTablePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to sdc!');
  });
});
