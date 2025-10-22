import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DcReportComponent } from './dc-report.component';

describe('DcReportComponent', () => {
  let component: DcReportComponent;
  let fixture: ComponentFixture<DcReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DcReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DcReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
