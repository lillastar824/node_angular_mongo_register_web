import { createAction, props } from '@ngrx/store';
import { User } from '../model/user';
export const getUsers = createAction('[to-do] get users');

export const loadUsers = createAction(
  '[to-do] load users',
  props<{ users: User[] }>()
);

export const addUser = createAction(
  '[to-do] add User',
  props<{ name: string }>()
);

export const deleteUser = createAction(
  '[to-do] delete User',
  props<{ User: User }>()
);

export const errorUser = createAction(
  '[to-do] error User',
  props<{ message: string }>()
);