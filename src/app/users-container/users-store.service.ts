import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

export enum FilterType {
  none = 'none',
  search = 'search',
  selection = 'selection',
}

export interface User {
  name: string;
  surname: string;
  email: string;
}

export interface UsersState {
  users: User[];
  selectAll: { checked: boolean };
  selectedUsers: User[];
  searchTerm: string;
  filterType: FilterType;
}

@Injectable()
export class UsersStoreService extends ComponentStore<UsersState> {
  //state selectors:
  users$: Observable<User[]> = this.select(state => state.users);
  selectedUsers$: Observable<User[]> = this.select(state => state.selectedUsers);
  selectAll$: Observable<{ checked: boolean }> = this.select(state => state.selectAll);
  searchTerm$: Observable<string> = this.select(state => state.searchTerm);
  filterType$: Observable<string> = this.select(state => state.filterType);

  // combined selectors:
  deleteDisabled$: Observable<boolean> = this.select(
    this.selectedUsers$,
    (selectedUsers) => !!selectedUsers && !selectedUsers.length
  );

  filteredBySearch$: Observable<User[]> = this.select(
    this.users$,
    this.searchTerm$,
    (users, searchTerm) => {
      if (!searchTerm.length) return users;
      else return users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  );

  filteredUsers$: Observable<User[]> = this.select(
    this.filterType$,
    this.users$,
    this.selectedUsers$,
    this.filteredBySearch$,
    (filteredType, users, selectedUsers, filteredBySearch) => {
      switch (filteredType) {
        case FilterType.none: return users;
        case FilterType.search: return filteredBySearch;
        case FilterType.selection: return selectedUsers;
      }
    }
  );

  isAllSelected$: Observable<boolean> = this.select(
    this.filteredUsers$,
    this.selectedUsers$,
    (filtered, selected) => !!filtered.length && filtered.length === selected.length
  );

  canClear$: Observable<boolean> = this.select(
    this.selectedUsers$,
    this.isAllSelected$,
    (selectedUsers, isAllSelected) => !!selectedUsers.length && !isAllSelected
  );

  canSelect$: Observable<boolean> = this.select(
    this.filteredUsers$,
    (filtered) => !!filtered.length
  )

  canFilterBySelection$: Observable<boolean> = this.select(
    this.selectedUsers$,
    (selectedUsers) => !!selectedUsers.length
  );

  canUnfilter$: Observable<boolean> = this.select(
    this.filterType$,
    (filterType) => filterType !== FilterType.none
  );

  constructor() {
    super()
  }

  //updaters:
  updateSelectAll(checked: boolean) {
    const currentFilterType = this.get(state => state.filterType);
    const filterType = currentFilterType === FilterType.selection ? FilterType.none : currentFilterType;
    this.patchState({ selectAll: { checked }, filterType })
  }

  updateSelectedUsers(selectedUsers: User[]) {
    this.patchState({ selectedUsers })
  }

  updateSearchTerm(searchTerm: string) {
    this.patchState({ searchTerm, filterType: FilterType.search })
  }

  clear() {
    this.patchState({ selectAll: { checked: false }, selectedUsers: [] });
  }

  filterBySelection() {
    this.patchState({ filterType: FilterType.selection });
  }

  unfilter() {
    this.patchState({ filterType: FilterType.none, searchTerm: '' });
  }

  //effects:
}
