import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFavoritePageComponent } from './add-favorite-page.component';

describe('AddFavoritePageComponent', () => {
  let component: AddFavoritePageComponent;
  let fixture: ComponentFixture<AddFavoritePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFavoritePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFavoritePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
