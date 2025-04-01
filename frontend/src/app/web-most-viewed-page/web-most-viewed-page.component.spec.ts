import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebMostViewedPageComponent } from './web-most-viewed-page.component';

describe('WebMostViewedPageComponent', () => {
  let component: WebMostViewedPageComponent;
  let fixture: ComponentFixture<WebMostViewedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebMostViewedPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebMostViewedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
