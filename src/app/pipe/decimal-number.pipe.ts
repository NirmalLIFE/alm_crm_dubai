import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalNumber'
})
export class DecimalNumberPipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    return value.toString().replace(/,/g, '');
  }

}
