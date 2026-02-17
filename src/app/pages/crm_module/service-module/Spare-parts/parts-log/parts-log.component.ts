import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
  selector: 'app-parts-log',
  templateUrl: './parts-log.component.html',
  styleUrls: ['./parts-log.component.css']
})
export class PartsLogComponent implements OnInit {
  logs: any;
  load_flag: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private userServices: StaffPostAuthService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['pm_id']) {
        const decoded = atob(params['pm_id']);
        this.fetchLogs(decoded);

      }
    });
  }

  fetchLogs(pm_id: string): void {
    const data = {
      pm_id: pm_id
    };
    this.load_flag = true;

    this.userServices.getPartsLog(data).subscribe({
      next: (rdata: any) => {
        if (rdata.ret_data === 'success') {
          this.logs = rdata.partsLog;
          this.load_flag = false;
          console.log(rdata);
        } else {
          this.load_flag = false;
        }
      },
      error: (err: any) => {
        this.load_flag = false;
        console.log(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/spare-parts/parts-list']);
  }

  formatLogNotes(note: string): string {

  if (!note) return '';

  return note
    .replace(/Old Price\):\s?([\d,\.]+)/g,
      'Old Price): <span class="text-red-600 font-semibold">$1</span>')

    .replace(/New Price\):\s?([\d,\.]+)/g,
      'New Price): <span class="text-green-600 font-semibold">$1</span>')

    .replace(/Updated By User:\s?([^\.]+)/g,
      'Updated By User: <span class="text-blue-600 font-semibold">$1</span>')

    .replace(/Affected Models are:/g,
      '<br><br><span class="font-semibold text-gray-700 dark:text-gray-300">Affected Models:</span><br>');
}

}
