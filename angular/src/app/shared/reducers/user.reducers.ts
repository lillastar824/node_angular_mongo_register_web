import { loadUsers, errorUser } from '../actions/user.actions';
import { on, createReducer } from '@ngrx/store';
import { User } from '../model/user';

export interface State {
  toDo: { user: User[]; error: string };
}

export const initialState: State = {
  toDo: { user: [], error: '' }
};

export const UserReducer = createReducer(
  initialState,
  on(loadUsers, (state, action) => ({
    ...state,
    user: action.users
  })),
  on(errorUser, (state, action) => ({
    ...state,
    error: action.message
  }))
);

export const selectUsers = (state: State) => state.toDo.user;

export const selectError = (state: State) => state.toDo.error;
