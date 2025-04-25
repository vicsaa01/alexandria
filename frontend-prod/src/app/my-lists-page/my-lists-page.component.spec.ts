import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyListsPageComponent } from './my-lists-page.component';

describe('MyListsPageComponent', () => {
  let component: MyListsPageComponent;
  let fixture: ComponentFixture<MyListsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyListsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
