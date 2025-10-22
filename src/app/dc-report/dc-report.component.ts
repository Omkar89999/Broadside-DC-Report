// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { forkJoin } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms'; 
// import { environment } from '../../environments/environment';



// interface ReportRow {
//   app: string;
//   dcs1: number;
//   ltip: number;
//   ltih: number;
//   total?: number; 
// }

// @Component({
//   selector: 'app-dc-report',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './dc-report.component.html',
//   styleUrls: ['./dc-report.component.css']
// })
// export class DcReportComponent implements OnInit {
//   startDate: string = '';
//   endDate: string = '';
//   reportData: ReportRow[] = []; 
//   isGenerating: boolean = false;

//   constructor(private http: HttpClient) { }

//   ngOnInit() {
   
//     this.startDate = '';
//     this.endDate = '';
//   }
  
//   generateReport() {

//     // this.isGenerating = true; 

//     const start = `${this.startDate}T00:00:00Z`;
//     const end = `${this.endDate}T23:59:59Z`;

//     // const dcs1Url = `/solr1/collection1/select?facet.field=bml_app&facet=on&q=bml_dispatchedat:[${start} TO ${end}]&rows=0&start=0&wt=json`;
//     // const ltipUrl = `/solr2/collection1/select?facet.field=bml_app&facet=on&q=bml_dispatchedat:[${start} TO ${end}]&rows=0&start=0&wt=json`;
//     // const ltihUrl = `/solr3/collection1/select?facet.field=bml_app&facet=on&q=bml_dispatchedat:[${start} TO ${end}]&rows=0&start=0&wt=json`;
//     const dcs1Url = `${environment.apiBaseUrl1}/collection1/select?...`;
//     const ltipUrl = `${environment.apiBaseUrl2}/collection1/select?...`;
//     const ltihUrl = `${environment.apiBaseUrl3}/collection1/select?...`;
    

//     forkJoin({
//       dcs1: this.http.get<any>(dcs1Url),
//       ltip: this.http.get<any>(ltipUrl),
//       ltih: this.http.get<any>(ltihUrl)
//     }).subscribe({
//       next: (responses) => {
//         const dcs1Counts = this.mapFacetCounts(responses.dcs1);
//         const ltipCounts = this.mapFacetCounts(responses.ltip);
//         const ltihCounts = this.mapFacetCounts(responses.ltih);

//         type CountKeys = 'dcs1' | 'ltip' | 'ltih';


//         const merged: Record<string, ReportRow> = {};

//         [dcs1Counts, ltipCounts, ltihCounts].forEach((counts, i) => {
//           const key: CountKeys = ['dcs1', 'ltip', 'ltih'][i] as CountKeys; 
//           for (const app in counts) {
//             if (!merged[app]) merged[app] = { app, dcs1: 0, ltip: 0, ltih: 0 };
//             merged[app][key] = counts[app];
//           }
//         });

//         this.reportData = Object.values(merged).map(row => ({
//           ...row,
//           total: row.dcs1 + row.ltip + row.ltih
//         }));
//       },
//       error: (err) => console.error('Error fetching reports:', err)
//     });
//   }

//   private mapFacetCounts(response: any): Record<string, number> {
//     const arr = response?.facet_counts?.facet_fields?.bml_app || [];
//     const map: Record<string, number> = {};
//     for (let i = 0; i < arr.length; i += 2) {
//       map[arr[i]] = arr[i + 1];
//     }
//     return map;
//   }

//   get grandTotal() {
//     return this.reportData.reduce(
//       (acc, row) => {
//         acc.dcs1 += row.dcs1 || 0;
//         acc.ltip += row.ltip || 0;
//         acc.ltih += row.ltih || 0;
//         acc.total += (row.total || 0);
//         return acc;
//       },
//       { dcs1: 0, ltip: 0, ltih: 0, total: 0 }
//     );
//   }
  
// }


import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { environment } from '../../environments/environment';

interface ReportRow {
  app: string;
  dcs1: number;
  ltip: number;
  ltih: number;
  total?: number; 
}

@Component({
  selector: 'app-dc-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dc-report.component.html',
  styleUrls: ['./dc-report.component.css']
})
export class DcReportComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  reportData: ReportRow[] = []; 
  isGenerating: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.startDate = '';
    this.endDate = '';
  }

  generateReport() {
    const start = `${this.startDate}T00:00:00Z`;
    const end = `${this.endDate}T23:59:59Z`;

    // const dcs1Url = `${environment.apiBaseUrl1}/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;
    // const ltipUrl = `${environment.apiBaseUrl2}/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;
    // const ltihUrl = `${environment.apiBaseUrl3}/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;

    const dcs1Url = `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;

    const ltipUrl = `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;
    
    const ltihUrl = `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`;
    

    forkJoin({
      dcs1: this.http.get(dcs1Url, { responseType: 'text' }),
      ltip: this.http.get(ltipUrl, { responseType: 'text' }),
      ltih: this.http.get(ltihUrl, { responseType: 'text' })
    }).subscribe({
      next: (responses) => {
        const dcs1Counts = this.safeParseCounts(responses.dcs1);
        const ltipCounts = this.safeParseCounts(responses.ltip);
        const ltihCounts = this.safeParseCounts(responses.ltih);

        type CountKeys = 'dcs1' | 'ltip' | 'ltih';
        const merged: Record<string, ReportRow> = {};

        [dcs1Counts, ltipCounts, ltihCounts].forEach((counts, i) => {
          const key: CountKeys = ['dcs1', 'ltip', 'ltih'][i] as CountKeys; 
          for (const app in counts) {
            if (!merged[app]) merged[app] = { app, dcs1: 0, ltip: 0, ltih: 0 };
            merged[app][key] = counts[app];
          }
        });

        this.reportData = Object.values(merged).map(row => ({
          ...row,
          total: row.dcs1 + row.ltip + row.ltih
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching reports:', err);
      }
    });
  }

  private safeParseCounts(responseText: string): Record<string, number> {
    try {
      const response = JSON.parse(responseText);
      return this.mapFacetCounts(response);
    } catch (e) {
      console.warn('Response is not valid JSON. Raw response:', responseText);
      return {}; // return empty object if parsing fails
    }
  }

  private mapFacetCounts(response: any): Record<string, number> {
    const arr = response?.facet_counts?.facet_fields?.bml_app || [];
    const map: Record<string, number> = {};
    for (let i = 0; i < arr.length; i += 2) {
      map[arr[i]] = arr[i + 1];
    }
    return map;
  }

  get grandTotal() {
    return this.reportData.reduce(
      (acc, row) => {
        acc.dcs1 += row.dcs1 || 0;
        acc.ltip += row.ltip || 0;
        acc.ltih += row.ltih || 0;
        acc.total += row.total || 0;
        return acc;
      },
      { dcs1: 0, ltip: 0, ltih: 0, total: 0 }
    );
  }
}
