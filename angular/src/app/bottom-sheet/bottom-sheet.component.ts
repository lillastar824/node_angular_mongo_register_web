import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-bottom-sheet',
    templateUrl: './bottom-sheet.component.html',
    styleUrls: ['./bottom-sheet.component.css']
})
export class BottomSheetComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<BottomSheetComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }
        
    ngOnInit() {
        setTimeout(()=>{
            document.querySelector('.image').scrollIntoView(true);
        },250)
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    updateUrl(event, imgSRC) {
        event.target.src = imgSRC;
      }
}
