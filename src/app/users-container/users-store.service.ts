import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, catchError, EMPTY } from 'rxjs';
import { UsersService, ListCriteria } from '../users.service';
import { switchMap, tap } from 'rxjs/operators';

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
  filterType: FilterType;
  isLoading: boolean;
  count: number;
  error: any;
  criteria: ListCriteria;
}

@Injectable()
export class UsersStoreService extends ComponentStore<UsersState> {
  //state selectors:
  users$: Observable<User[]> = this.select(state => state.users);
  selectedUsers$: Observable<User[]> = this.select(state => state.selectedUsers);
  selectAll$: Observable<{ checked: boolean }> = this.select(state => state.selectAll);
  filterType$: Observable<string> = this.select(state => state.filterType);
  isLoading$: Observable<boolean> = this.select(state => state.isLoading);
  count$: Observable<number> = this.select(state => state.count);
  error$: Observable<any> = this.select(state => state.error);
  criteria$: Observable<ListCriteria> = this.select(state => state.criteria);
  searchTerm$: Observable<string> = this.select(state => state.criteria.search);
  limit$: Observable<number> = this.select(state => state.criteria.limit);
  page$: Observable<number> = this.select(state => state.criteria.page);
  sortBy$: Observable<string> = this.select(state => state.criteria.sortBy);
  order$: Observable<string> = this.select(state => state.criteria.order);

  // combined selectors:
  distinctCriteria$: Observable<ListCriteria> = this.select(
    this.searchTerm$,
    this.page$,
    this.limit$,
    this.sortBy$,
    this.order$,
    (search, page, limit, sortBy, order) => ({ search, page, limit, sortBy, order })
  );

  selectedLength$: Observable<number> = this.select(
    this.selectedUsers$,
    (selectedUsers) => selectedUsers.length
  )

  deleteDisabled$: Observable<boolean> = this.select(
    this.selectedUsers$,
    (selectedUsers) => !!selectedUsers && !selectedUsers.length
  );

  filteredUsers$: Observable<User[]> = this.select(
    this.filterType$,
    this.users$,
    this.selectedUsers$,
    (filteredType, users, selectedUsers) => {
      switch (filteredType) {
        case FilterType.search:
        case FilterType.none: return users;
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
    this.selectedLength$,
    this.isAllSelected$,
    (selectedLength, isAllSelected) => !!selectedLength && !isAllSelected
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

  constructor(private usersService: UsersService) {
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

  updateSearchTerm(search: string) {
    const currentCriteria = this.get(state => state.criteria);
    const criteria = { ...currentCriteria, search };
    this.patchState({ filterType: FilterType.search, criteria })
  }

  clear() {
    this.patchState({ selectAll: { checked: false }, selectedUsers: [] });
  }

  filterBySelection() {
    const currentCriteria = this.get(state => state.criteria);
    const criteria = { ...currentCriteria, search: '' };
    this.patchState({ filterType: FilterType.selection, criteria });
  }

  unfilter() {
    const currentCriteria = this.get(state => state.criteria);
    const criteria = { ...currentCriteria, search: '' };
    this.patchState({ filterType: FilterType.none, criteria });
  }

  sort(event: { active: string, direction: string }) {
    const currentCriteria = this.get(state => state.criteria);
    const criteria = { ...currentCriteria, sortBy: event.active, order: event.direction };
    this.patchState({ criteria });
  }

  updatePage(page: number) {
    const currentCriteria = this.get(state => state.criteria);
    const criteria = { ...currentCriteria, page };
    this.patchState({ criteria });
  }

  //effects:
  readonly listUsers = this.effect((criteria$: Observable<ListCriteria>) => {
    return criteria$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((criteria) => this.usersService.list(criteria).pipe(
        tap({
          next: (response) => this.patchState({ isLoading: false, users: response['results'], count: response['count'] }),
          error: (error) => this.patchState({ isLoading: false, error })
        }),
        catchError(() => EMPTY)
      ))
    )
  })
}
