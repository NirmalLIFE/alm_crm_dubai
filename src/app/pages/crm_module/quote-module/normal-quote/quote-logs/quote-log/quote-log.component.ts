import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-quote-log',
    templateUrl: './quote-log.component.html',
    styleUrls: ['./quote-log.component.css'],
})
export class QuoteLogComponent implements OnInit,AfterViewChecked {
    @Input() quoteId: any;
    @Input() quoteCode: any;
    @ViewChild('scrollable')scrollable !: NgScrollbar;
    public load_flag: boolean = true;
    public quoteLogs: any = [];
    private shouldScroll: boolean = false;
    public us_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router) {}

    ngOnInit(): void {
        this.getQuoteLogs();
    }
    ngAfterViewChecked() {
      if (this.shouldScroll) {
        this.scrollToBottom();
        this.shouldScroll = false;  // Reset the flag after scrolling
      }
    }
    scrollToBottom() {
      this.scrollable.scrollTo({bottom: 0});
  }

    getQuoteLogs() {
        let data = {
            quoteId: this.quoteId,
        };

        this.userServices.getQuoteLogs(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.quoteLogs = rdata.quotes_log;
                this.load_flag = false;
                this.shouldScroll=true;
            } else {
                this.load_flag = false;
            }
        });
    }
}
