import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { User, UsersStoreService } from './users-store.service';

@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStoreService]
})
export class UsersContainerComponent implements OnInit {
  deleteDisabled$ = this.store.deleteDisabled$;
  selectAll$ = this.store.selectAll$;
  users$ = this.store.filteredUsers$;

  constructor(private store: UsersStoreService) { }

  ngOnInit(): void {
    this.store.setState({
      users: [
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Maria', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Maria', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Maria', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Caroline', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Caroline', surname: 'Doe', email: 'doe@acme.com' },
        { name: 'Jhon', surname: 'Doe', email: 'doe@acme.com' },
      ],
      selectAll: false,
      selectedUsers: [],
      searchTerm: '',
    })
  }

  handleSelectAll(selectAll: boolean) {
    this.store.updateSelectAll(selectAll);
  }

  handleSelectedUsers(selectedUsers: User[]) {
    this.store.updateSelectedUsers(selectedUsers);
  }

  handleSearch(searchTerm: string) {
    this.store.updateSearchTerm(searchTerm);
  }
}
