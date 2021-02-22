import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-similar-sign-in',
    templateUrl: './similar-sign-in.component.html',
    styleUrls: ['./similar-sign-in.component.css']
})
export class SimilarSignInComponent implements OnInit {

    similarSign: string[] = [];
    similarSignOriginal: string[] = [];
    errorMessage: boolean = false;
    selectedSign: string;
    filterSimilarSign: string;
    noSimilarSign: boolean = false;
    constructor(private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private SpinnerService: NgxSpinnerService,
        public dialogRef: MatDialogRef<SimilarSignInComponent>) {
            this.SpinnerService.show();
        }

    ngOnInit() {
        this.listSimilarHandle(this.userService.selectHandle.atsignName);
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    listSimilarHandle(atsignName) {
        this.userService.listSimilarAtSigns({ handle: atsignName }).subscribe(
            res => {
                this.noSimilarSign = true;
                if (res['status'] === 'success') {
                    let response: [] = res['data'];
                    for (let i in response) {
                        this.similarSignOriginal.push(response[i]['atsignName']);
                    }
                    this.similarSign = this.similarSignOriginal;
                } else {
                    this.errorMessage = true;
                }
                this.SpinnerService.hide();
            },
            err => {
                this.SpinnerService.hide();
                this.errorMessage = true;
            }
        );
    }
    selectHandle(selectedSign) {
        if (selectedSign) {
            this.userService.selectHandle.atsignName = selectedSign;
        }
        this.onNoClick();
    }
    filterResult(filter) {
        if (filter === 'letter') {
            if (this.filterSimilarSign === 'letter') {
                this.filterSimilarSign = '';
                this.similarSign = this.similarSignOriginal;
            } else {
                this.filterSimilarSign = 'letter';
                this.similarSign = this.similarSignOriginal.filter(e => (!/[^a-zA-Z]/.test(e)));
            }
        } else if (filter === 'shortest') {
            if (this.filterSimilarSign === 'shortest') {
                this.filterSimilarSign = '';
                this.similarSign = this.similarSignOriginal;
            } else {
                this.filterSimilarSign = 'shortest';
                this.similarSign = this.similarSignOriginal.sort((x, y) => x.length - y.length);
            }
        } else if (filter === 'specialChar') {
            if (this.filterSimilarSign === 'specialChar') {
                this.filterSimilarSign = '';
                this.similarSign = this.similarSignOriginal;
            } else {
                this.filterSimilarSign = 'specialChar';
                this.similarSign = this.similarSignOriginal.filter(e => (!/[^a-zA-Z0-9]/.test(e)));
            }
        }
    }

}
