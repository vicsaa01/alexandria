import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedTableComponent } from './extended-table.component';

describe('ExtendedTableComponent', () => {
  let component: ExtendedTableComponent;
  let fixture: ComponentFixture<ExtendedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtendedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtendedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
