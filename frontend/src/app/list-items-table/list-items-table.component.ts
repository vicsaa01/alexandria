import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-list-items-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-items-table.component.html',
  styleUrl: './list-items-table.component.css'
})
export class ListItemsTableComponent extends DefaultTableComponent {
  @Input() list_id: string | null = '';

  // Add ActivatedRoute property when loading page
  constructor(private route: ActivatedRoute) {
    super();
  }
  
  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.list_id = params.get('id');
    });
  }

  removeFromList(favorite_id: any): void {
    if (!this.list_id) {
      return;
    }
    fetch(apiURL + '/remove-from-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        favorite_id: favorite_id.$oid,
        list_id: this.list_id
      })
    })
    .then(res => res.json()) 
    .then((data) => {
      alert(data.message);
      window.location.reload();
    })
    .catch(error => {
      console.error('Error: ', error);
      alert("Server did not respond. Please try again later.");
    });
  }
}
