import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addUser, getUsers, deleteUser } from '../actions/user.actions';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../services/user.service';
@Injectable()
export class UserEffect {
      loadUsers$ = createEffect(() =>
        this.actions$.pipe(
          ofType(getUsers),
          switchMap(action => {
            const usersLoaded = this.toDoService.getUserDetails;
            return of({ 
              type: '[to-do] load users', users: usersLoaded 
            });
          }),
          catchError(error => of({ 
            type: '[to-do] error user', message: error 
          }))
        )
      );
  
    addUser$ = createEffect(() =>
        this.actions$.pipe(
          ofType(addUser),
          switchMap(action => {
            this.toDoService.addUser(action.name);
            const usersLoaded = this.toDoService.getUserDetails;
            return of({ 
              type: '[to-do] load users', users: usersLoaded 
            });
          }),
          catchError(error => of({ 
            type: '[to-do] error user', message: error 
          }))
        )
      );

    deleteUser$ = createEffect(() =>
        this.actions$.pipe(
          ofType(deleteUser),
          switchMap(action => {
            this.toDoService.deleteUser(action.User);
            const usersLoaded = this.toDoService.getUserDetails;
            return of({ 
              type: '[to-do] load users', users: usersLoaded 
            });
          }),
          catchError(error => of({ 
            type: '[to-do] error user', message: error 
          }))
        )
      );

    constructor(
        private actions$: Actions, 
        private toDoService: UserService
      ) {}
}