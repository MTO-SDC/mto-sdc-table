import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe, DatePipe, LowerCasePipe, UpperCasePipe, PercentPipe } from '@angular/common';


@Pipe({name: 'pipeJoin'})

export class PipeJoin implements PipeTransform {
  transform(value: any, pipeOptions: any): any {
    if (!pipeOptions) {
      return value;
    }
    if (pipeOptions.custom) {
      value = pipeOptions.custom(value);
    }
    if (pipeOptions.currency) {
      value = new CurrencyPipe('en-ca').transform(value,
        pipeOptions.currency.param1 ? pipeOptions.currency.param1 : 'CAD',
        pipeOptions.currency.param2 === undefined || pipeOptions.currency.param2 ? true : false,
        pipeOptions.currency.param3 ? pipeOptions.currency.param3 : '1.2-2');
    } else if (pipeOptions.date) {
      value = new DatePipe('en-ca').transform(value, pipeOptions.date.param1);
    } else if (pipeOptions.percent) {
      value = new PercentPipe('en-ca').transform(value, pipeOptions.percent.param1);
    }

    if (pipeOptions.upperCase) {
      value = new UpperCasePipe().transform(value);
    } else if (pipeOptions.lowerCase) {
      value = new LowerCasePipe().transform(value);
    }
    return value;
  }
}
