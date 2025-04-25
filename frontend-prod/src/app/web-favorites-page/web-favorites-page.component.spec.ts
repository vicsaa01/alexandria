import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebFavoritesPageComponent } from './web-favorites-page.component';

describe('WebFavoritesPageComponent', () => {
  let component: WebFavoritesPageComponent;
  let fixture: ComponentFixture<WebFavoritesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebFavoritesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebFavoritesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
