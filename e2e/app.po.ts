import { browser, by, element } from 'protractor';

export class SdcTablePage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('sdc-root h1')).getText();
  }
}
