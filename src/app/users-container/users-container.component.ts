import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FilterType, User, UsersStoreService } from './users-store.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStoreService]
})
export class UsersContainerComponent implements OnInit, OnDestroy {
  unsubscribe = new Subject<void>();

  deleteDisabled$ = this.store.deleteDisabled$;
  isAllSelected$ = this.store.isAllSelected$;
  canClear$ = this.store.canClear$;
  canSelect$ = this.store.canSelect$;
  canFilterBySelection$ = this.store.canFilterBySelection$;
  selectAll$ = this.store.selectAll$;
  users$ = this.store.filteredUsers$;
  searchTerm$ = this.store.searchTerm$;
  canUnfilter$ = this.store.canUnfilter$;
  isLoading$ = this.store.isLoading$;
  distinctCriteria$ = this.store.distinctCriteria$;
  limit$ = this.store.limit$;
  count$ = this.store.count$;
  error$ = this.store.error$.pipe(filter(e => !!e));

  constructor(private store: UsersStoreService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.store.setState({
      users: [],
      selectAll: { checked: false },
      selectedUsers: [],
      filterType: FilterType.none,
      isLoading: false,
      count: 0,
      error: null,
      criteria: { search: '', limit: 10, page: 1, sortBy: 'name', order: 'asc' }
    });
    this.store.listUsers(this.distinctCriteria$);
    this.error$.pipe(
      takeUntil(this.unsubscribe)
    ).subscribe(e => this.snackBar.open(e.message, 'Close', { duration: 2500 }))
  }

  ngOnDestroy() {
    this.unsubscribe.next();
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

  handleClear() {
    this.store.clear();
  }

  handleEmitFilterBySelection() {
    this.store.filterBySelection();
  }

  handleEmitUnfilter() {
    this.store.unfilter();
  }

  handleEmitSort(event: { active: string, direction: string }) {
    this.store.sort(event);
  }

  handleEmitPageIndex(pageIndex: number) {
    this.store.updatePage(pageIndex + 1);
  }
}
