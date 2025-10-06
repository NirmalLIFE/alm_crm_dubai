import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-psf-call-history',
    templateUrl: './psf-call-history.component.html',
    styleUrls: ['./psf-call-history.component.css'],
})
export class PsfCallHistoryComponent implements OnInit {
    @Input() oldcalldata: any;
    @Output() modalEvent = new EventEmitter<boolean>();
    rating: { value: any }[] = [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }];
    action: { name: string; value: any }[] = [
        { name: 'Transfer the call', value: '1' },
        { name: 'Educated & Closed', value: '2' },
        { name: 'Closed with approval', value: '3' },
        { name: 'Revisit Requested', value: '4' },
        { name: 'Apology over phone/mail', value: '5' },
    ];
    response: { name: string; value: any }[] = [
        { name: 'Answered', value: '1' },
        { name: 'Not Answered', value: '2' },
    ];
    constructor() {
    }

    ngOnInit(): void {

    }
}
