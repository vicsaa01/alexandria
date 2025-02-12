import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTableComponent } from './default-table.component';

describe('DefaultTableComponent', () => {
  let component: DefaultTableComponent;
  let fixture: ComponentFixture<DefaultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
