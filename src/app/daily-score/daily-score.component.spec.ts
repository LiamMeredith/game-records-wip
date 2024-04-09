import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyScoreComponent } from './daily-score.component';

describe('DailyScoreComponent', () => {
  let component: DailyScoreComponent;
  let fixture: ComponentFixture<DailyScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyScoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
