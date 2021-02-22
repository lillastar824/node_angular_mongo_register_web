import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { throwError } from 'rxjs';

import { UserService } from "../shared/services/user.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (!window.navigator.onLine) {
            const error = {
                status: 0,
                error: {
                    description: 'Check Connectivity!'
                },
                statusText: 'Check Connectivity!'
            };
            this._snackBar.open('No internet connection.', 'x', {
                duration: 15000,
                panelClass: ['custom-snackbar']
            });
            return throwError(new HttpErrorResponse(error));
        } else {
            if (req.headers.get('noauth'))
                return next.handle(req.clone());
            else {
                const clonedreq = req.clone({
                    headers: req.headers.set("Authorization", "Bearer " + this.userService.getToken())
                });
                return next.handle(clonedreq).pipe(
                    tap(
                        event => { },
                        err => {
                            if (err.error.auth == false) {
                                this.router.navigateByUrl('/login');
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('token');
                                // this.userService.deleteToken();
                            }
                        })
                );
            }
        }
    }
}