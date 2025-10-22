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
  total: number;
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.startDate = '';
    this.endDate = '';
  }

  generateReport() {
    if (!this.startDate || !this.endDate) return;

    this.isGenerating = true;

    const start = `${this.startDate}T00:00:00Z`;
    const end = `${this.endDate}T23:59:59Z`;

    const urls = {
      dcs1: `/.netlify/functions/proxy-solr?path=/solr1/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`,
      ltip: `/.netlify/functions/proxy-solr?path=/solr2/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`,
      ltih: `/.netlify/functions/proxy-solr?path=/solr3/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`
    };

    forkJoin({
      dcs1: this.http.get<any>(urls.dcs1),
      ltip: this.http.get<any>(urls.ltip),
      ltih: this.http.get<any>(urls.ltih)
    }).subscribe({
      next: (responses) => {
        const dcs1Counts = this.mapFacetCounts(responses.dcs1);
        const ltipCounts = this.mapFacetCounts(responses.ltip);
        const ltihCounts = this.mapFacetCounts(responses.ltih);

        const merged: Record<string, ReportRow> = {};
        const keys: Array<'dcs1' | 'ltip' | 'ltih'> = ['dcs1', 'ltip', 'ltih'];
        const countsArr = [dcs1Counts, ltipCounts, ltihCounts];

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const counts = countsArr[i];
          for (const app in counts) {
            if (!merged[app]) merged[app] = { app, dcs1: 0, ltip: 0, ltih: 0, total: 0 };
            merged[app][key] = counts[app];
          }
        }

        // Compute total for each row
        this.reportData = Object.values(merged).map(row => ({
          ...row,
          total: row.dcs1 + row.ltip + row.ltih
        }));

        this.isGenerating = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching reports:', err);
        this.isGenerating = false;
      }
    });
  }

  private mapFacetCounts(response: any): Record<string, number> {
    const arr = response?.facet_counts?.facet_fields?.bml_app || [];
    const map: Record<string, number> = {};
    for (let i = 0; i < arr.length; i += 2) {
      const app = String(arr[i]);
      const count = Number(arr[i + 1]) || 0;
      map[app] = count;
    }
    return map;
  }

  get grandTotal() {
    return this.reportData.reduce(
      (acc, row) => {
        acc.dcs1 += row.dcs1;
        acc.ltip += row.ltip;
        acc.ltih += row.ltih;
        acc.total += row.total;
        return acc;
      },
      { dcs1: 0, ltip: 0, ltih: 0, total: 0 }
    );
  }
}
