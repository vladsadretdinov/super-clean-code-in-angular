import { Injectable } from '@angular/core';
import { User } from './users-container/users-store.service';
import { Observable, catchError, throwError, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Users } from './users.mock';

export interface ListCriteria {
  sortBy: string;
  order?: string;
  search: string;
  limit: number;
  page: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  apiUrl = "https://<YOUR-UNIQUE-HASH>.mockapi.io/api/users";

  constructor(private http: HttpClient) {
    const criteria: ListCriteria = { search: '', sortBy: 'createdAt', page: 1, limit: 10 };
    this.list(criteria).subscribe(users => console.log('get users response', users));
  }

  listOriginal(criteria?: ListCriteria): Observable<User[]> {
    if (!criteria) criteria = { search: '', limit: 10, page: 1, sortBy: 'name', order: 'asc' };
    const order = criteria.order ? criteria.order : 'asc';
    criteria = { ...criteria, order } as any;
    return this.http.get<User[]>(this.apiUrl, { params: <any>criteria })
      .pipe(
        delay(2000),
        catchError(this.handleError)
      )
  }

  /*
    Original method from video is changed by mock version below for easy demonstration of working
  */

  list(criteria?: ListCriteria): Observable<any> {
    if (!criteria) criteria = { search: '', limit: 10, page: 1, sortBy: 'name', order: 'asc' };
    const order = criteria.order ? criteria.order : 'asc';
    criteria = { ...criteria, order } as any;

    const sortedUsers = [...Users].sort((a, b) => {
      if (criteria.order == 'asc') {
        if (a[criteria.sortBy] < b[criteria.sortBy])
          return -1;
        if (a[criteria.sortBy] > b[criteria.sortBy])
          return 1;
        return 0;
      }

      if (a[criteria.sortBy] < b[criteria.sortBy])
        return 1;
      if (a[criteria.sortBy] > b[criteria.sortBy])
        return -1;
      return 0;
    });

    const offsetUsers = sortedUsers
      .filter(user => {
        if (criteria.search.trim() === "") {
          return true;
        }
        return user.name.includes(criteria.search)
      })
      .slice((criteria.page - 1) * criteria.limit, (criteria.page - 1) * criteria.limit + criteria.limit)

    return of({
      "count": sortedUsers.length,
      "results": offsetUsers
    });
  }

  delete(userId: number): Observable<User[]> {
    return this.http.delete<User[]>(`${this.apiUrl}/${userId}`)
      .pipe(
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log('An error occured:', error.error)
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error
      )
    }
    return throwError(() => new Error('Something bad happened; please try again later.'))
  }
}
