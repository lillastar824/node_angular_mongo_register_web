import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ShowUsersComponent } from './show-users.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {RouterTestingModule} from '@angular/router/testing'
import { FormsModule }   from '@angular/forms';
import {
  MatFormFieldModule, MatInputModule
} from '@angular/material';
import {MatTableModule} from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

describe('ShowUsersComponent', () => {
  let component: ShowUsersComponent;
  let fixture: ComponentFixture<ShowUsersComponent>;

  beforeEach(async(() => {
    console.log("in beforeeach")
    TestBed.configureTestingModule({
      declarations: [ ShowUsersComponent,
        MatSort,
        MatPaginator,
      ],
      imports:[
        FontAwesomeModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatCardModule,
        MatTooltipModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers:[
        MatSnackBar,
        MatDialog
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // expect(true).toBeTruthy();
    // expect(component).toBeTruthy();
  });
});
