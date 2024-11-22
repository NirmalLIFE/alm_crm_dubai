import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spare-dash',
  templateUrl: './spare-dash.component.html',
  styleUrls: ['./spare-dash.component.css']
})
export class SpareDashComponent {

  constructor(
    public router: Router,
  ){

  }
  loadQuotation(type:number){
    type==0?this.router.navigateByUrl('quotation/normal_quote/quote_list'):this.router.navigateByUrl('quotation/special_quote/quote_list')
  }
}
