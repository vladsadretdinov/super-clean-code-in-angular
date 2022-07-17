import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

export interface User {
  name: string;
  surname: string;
  email: string;
}

export interface UsersState {
  users: User[];
  selectAll: boolean;
  selectedUsers: User[];
  searchTerm: string;
}

@Injectable()
export class UsersStoreService extends ComponentStore<UsersState> {
  //state selectors:
  users$: Observable<User[]> = this.select(state => state.users);
  selectUsers$: Observable<User[]> = this.select(state => state.selectedUsers);
  selectAll$: Observable<boolean> = this.select(state => state.selectAll);
  searchTerm$: Observable<string> = this.select(state => state.searchTerm);

  // combined selectors:
  deleteDisabled$: Observable<boolean> = this.select(
    this.selectUsers$,
    (selectUsers) => !!selectUsers && !selectUsers.length
  );

  filteredUsers$: Observable<User[]> = this.select(
    this.users$,
    this.searchTerm$,
    (users, searchTerm) => {
      if (!searchTerm.length) return users;
      else return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  );

  constructor() {
    super()
  }

  //updaters:
  updateSelectAll(selectAll: boolean) {
    this.patchState({ selectAll })
  }

  updateSelectedUsers(selectedUsers: User[]) {
    this.patchState({ selectedUsers })
  }

  updateSearchTerm(searchTerm: string) {
    this.patchState({ searchTerm })
  }
  //effects:
}
