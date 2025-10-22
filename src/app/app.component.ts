import { Component } from '@angular/core';
import { DcReportComponent } from './dc-report/dc-report.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DcReportComponent], 
  template: `
    <!-- <h1>{{ title }}</h1> -->
    <app-dc-report></app-dc-report>  
  `,
})
export class AppComponent {
  // title = 'dc-report-app-standalone';
}
