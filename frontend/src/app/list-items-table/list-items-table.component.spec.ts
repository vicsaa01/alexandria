import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemsTableComponent } from './list-items-table.component';

describe('ListItemsTableComponent', () => {
  let component: ListItemsTableComponent;
  let fixture: ComponentFixture<ListItemsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListItemsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListItemsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
