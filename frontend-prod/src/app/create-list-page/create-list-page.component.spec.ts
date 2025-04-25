import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListPageComponent } from './create-list-page.component';

describe('CreateListPageComponent', () => {
  let component: CreateListPageComponent;
  let fixture: ComponentFixture<CreateListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
