import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    if (!this.startDate || !this.endDate) return;

    const start = `${this.startDate}T00:00:00Z`;
    const end = `${this.endDate}T23:59:59Z`;

    const urls = {
      dcs1: `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`,
      ltip: `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`,
      ltih: `/.netlify/functions/proxy-solr?path=/collection1/select?q=bml_dispatchedat:[${start} TO ${end}]&facet.field=bml_app&facet=on&rows=0&start=0&wt=json`
    };

    // this.isGenerating = true;

    forkJoin({
      dcs1: this.http.get(urls.dcs1, { responseType: 'text' }),
      ltip: this.http.get(urls.ltip, { responseType: 'text' }),
      ltih: this.http.get(urls.ltih, { responseType: 'text' })
    }).subscribe({
      next: (responses) => {
        const dcs1Counts = this.safeParseCounts(responses.dcs1);
        const ltipCounts = this.safeParseCounts(responses.ltip);
        const ltihCounts = this.safeParseCounts(responses.ltih);


        type CountKeys = 'dcs1' | 'ltip' | 'ltih';
        const merged: Record<string, ReportRow> = {};
        const keys: CountKeys[] = ['dcs1', 'ltip', 'ltih'];
        const countsArr = [dcs1Counts, ltipCounts, ltihCounts];

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]; // Type: CountKeys
          const counts = countsArr[i];
          for (const app in counts) {
            if (!merged[app]) merged[app] = { app, dcs1: 0, ltip: 0, ltih: 0 };
            merged[app][key] = counts[app] as number; // ✅ assert number
          }
        }

        this.reportData = Object.values(merged).map(row => ({
          ...row,
          total: row.dcs1 + row.ltip + row.ltih
        }));

        this.isGenerating = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.isGenerating = false;
      }
    });
  }

  private safeParseCounts(responseText: string): Record<string, number> {
    // Try JSON first
    try {
      const json = JSON.parse(responseText);
      return this.mapFacetCounts(json);
    } catch {
      // Fallback: parse XML safely
      return this.parseXmlCounts(responseText);
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

  private parseXmlCounts(xmlText: string): Record<string, number> {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
    const docs = xml.getElementsByTagName("doc");
    const map: Record<string, number> = {};
    for (let i = 0; i < docs.length; i++) {
      const appNode = docs[i].querySelector("int[name='bml_app']");
      if (appNode) {
        const app = appNode.textContent || 'Unknown';
        map[app] = (map[app] || 0) + 1;
      }
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
