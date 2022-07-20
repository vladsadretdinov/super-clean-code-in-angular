import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { User } from '../users-store.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit {
  @Input() users!: User[];
  @Input() set selectAll(selectAll: { checked: boolean }) {
    if (!this.usersList) return;
    if (selectAll.checked) {
      this.usersList.selectAll();
      this.emitSelectedUsers.emit(this.users);
    } else {
      this.usersList.deselectAll();
      this.emitSelectedUsers.emit([]);
    }
  }
  @Input() isLoading: boolean = false;

  @Output() emitSelectedUsers = new EventEmitter<User[]>();

  @ViewChild('usersList') usersList;

  constructor() { }

  ngOnInit(): void {
  }

  selectionChanged() {
    const selectedUsers = this.usersList.selectedOptions.selected.map(s => s.value);
    this.emitSelectedUsers.emit(selectedUsers);
  }
}
