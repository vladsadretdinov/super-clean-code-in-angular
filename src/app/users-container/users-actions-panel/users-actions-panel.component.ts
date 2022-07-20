import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-users-actions-panel',
  templateUrl: './users-actions-panel.component.html',
  styleUrls: ['./users-actions-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersActionsPanelComponent implements OnInit, OnDestroy {
  @Input() deleteDisabled: boolean;
  @Input() canClear: boolean;
  @Input() canFilterBySelection: boolean;
  @Input() canUnfilter: boolean = true;

  @Input() set searchTerm(searchTerm: string) {
    this.form.get('search').setValue(searchTerm, { emitEvent: false });
  }

  @Input() set canSelect(canSelect: boolean) {
    if (canSelect) this.form.get('selectAll').enable();
    else this.form.get('selectAll').disable();
  }

  @Input() set isAllSelected(isAllSelected: boolean) {
    this.form.get('selectAll').setValue(isAllSelected, { emitEvent: false });
  }

  @Output() emitSelectAll = new EventEmitter<boolean>();
  @Output() emitSearch = new EventEmitter<string>();
  @Output() emitClear = new EventEmitter<void>();
  @Output() emitFilterBySelection = new EventEmitter<void>();
  @Output() emitUnfilter = new EventEmitter<void>();

  form = new FormGroup({
    selectAll: new FormControl(false),
    search: new FormControl(''),
  })

  selectAllChanges$ = this.form.get('selectAll').valueChanges;
  searchChanges$ = this.form.get('search').valueChanges;
  unsubscribe = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
    this.selectAllChanges$.pipe(
      takeUntil(this.unsubscribe),
    ).subscribe(
      value => this.emitSelectAll.emit(value)
    );

    this.searchChanges$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe),
    ).subscribe(
      value => this.emitSearch.emit(value)
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  clear() {
    this.emitClear.emit();
  }

  filterBySelection() {
    this.emitFilterBySelection.emit();
  }

  unfilter() {
    this.emitUnfilter.emit();
  }
}
