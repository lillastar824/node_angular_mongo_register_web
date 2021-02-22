import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Routes, RouterModule, Router, ActivatedRoute } from "@angular/router";
import { UserService } from "../../shared/services/user.service";
import { FormControl, Validators } from "@angular/forms";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
  countries,
  names,
  starWars,
} from "unique-names-generator";
import { UtilityService } from "../../shared/services/utility.service";
import { NgxSpinnerService } from "ngx-spinner";
import { InterstitialLoaderService } from "src/app/shared/services/interstitial-loader.service";
import { MatSnackBar } from '@angular/material';
@Component({
  selector: "app-standard-sign",
  templateUrl: "./standard-sign.component.html",
  styleUrls: ["./standard-sign.component.css"],
})
export class StandardSignComponent implements OnInit {
  show = true;
  email: string;
  inviteCode: string;
  upgradeHandle: boolean = false;
  user: Object = {};
  friendInviteCode: string;
  isCalculatingAtsign: boolean;
  choices: Object = {};

  allfreeHandles: string[] = [
    "foods",
    "colors",
    "animals",
    "numbers",
    "hobbies",
    "movies",
    "sports",
    "music",
  ];
  freeHandles: string[] = [
    "foods",
    "colors",
    "animals",
    "numbers",
    "hobbies",
    "movies",
    "sports",
    "music",
  ];
  freeHandlesLabels: string[];
  randomName: string;
  randomNameArray: string[] = [];
  addRandomName;
  selectedType: string;
  userDetails;
  serverErrorMessages: string;
  atsignNameError: boolean = false;
  handleNotAvailable: boolean = false;
  showSucessMessage: boolean = false;
  showCustomizeDialog: boolean = false;
  disableCompute: boolean = true;
  selectionError: string = "";
  standardHandlesPlaceHolder: string[] = [];
  emptyIndex: number[] = [0, 1, 2, 3];
  interstitialLoader: boolean = false;
  randomMessage: string;
  freeSignCount: number;

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private utilityService: UtilityService,
    private SpinnerService: NgxSpinnerService,
    private interstitialLoaderService: InterstitialLoaderService,private _snackBar: MatSnackBar
  ) {
    this.interstitialLoader = true;
    this.freeHandlesLabels = [...this.userService.standardHandlesLabels];
    // this.userService.selectHandle['atsignType'] = 'free';
    // this.userService.selectHandle.subTotal = 0;
    this.route.params.subscribe((params) => {
      this.email = params["id"];
      let email = this.utilityService.checkEmailValid(this.email);
      if (email) {
        this.user["email"] = this.email;
      } else {
        this.user["contact"] = this.email;
      }

      this.inviteCode = params["inviteCode"];
      this.friendInviteCode = params["friendInviteCode"];
      // this.user['email'] = this.email;
      this.user["inviteCode"] = this.inviteCode;
      this.userService.selectHandle["inviteCode"] = this.inviteCode;
      this.upgradeHandle = params["upgrade"] === "false" ? false : true;
    });
    if (
      !this.userService.selectHandle["email"] &&
      !this.userService.selectHandle["contact"]
    ) {
      this.router.navigateByUrl("/premium-sign/" + this.inviteCode);
    }
    this.userService.getRandomOptions().subscribe(
      (res) => {
        this.choices = res["data"];
        this.choices["numbers"] = [];
        for (var i = 1; i <= 100; i++) {
          this.choices["numbers"].push(i.toString());
        }

        this.userService.selectHandle.foods &&
          this.choices["foods"].push(this.userService.selectHandle.foods);
        this.userService.selectHandle.colors &&
          this.choices["colors"].push(this.userService.selectHandle.colors);
        this.userService.selectHandle.animals &&
          this.choices["animals"].push(this.userService.selectHandle.animals);
        this.userService.selectHandle.sports &&
          this.choices["sports"].push(this.userService.selectHandle.sports);
        this.userService.selectHandle.movies &&
          this.choices["movies"].push(this.userService.selectHandle.movies);
        this.userService.selectHandle.music &&
          this.choices["music"].push(this.userService.selectHandle.music);
        this.userService.selectHandle.hobbies &&
          this.choices["hobbies"].push(this.userService.selectHandle.hobbies);

        this.generateRandomHandle(1);
      },
      (err) => {
        console.log(err);
      }
    );
    this.interstitialLoaderService.show({
      svg: "robot",
      message: "Rebooting flux capacitor…",
    });
  }

  ngOnInit() {}
  public getColor(balance: number): string {
    return balance > 0 ? "red" : "grey";
  }

  handleFormControl = new FormControl("", [Validators.required]);

  retry() {
    this.randomMessage = null;
    var randomMsg = [
      "Adjusting dingle arm radius…",
      "Negotiating with alien invaders…",
      "Charging flux capacitor…",
      "Initializing handshake with tiki gods…",
      "Shuffling tarot deck…",
      "Reticulating spline…",
      "Swapping time and space...",
      "Reconfoobling energymotron...",
      "Loading the enchanted bunny...",
      "1,2,3,4 I declare a thumb war…",
      "Winter is coming...",
      "Initializing the initializer...",
      "Pushing pixels…",
    ];
    this.randomMessage =
      randomMsg[Math.floor(Math.random() * randomMsg.length)];
    setTimeout(() => {
      this.randomMessage = null;
    }, 3000);
  }

  computeHandle() {
    this.serverErrorMessages = "";
    this.userService.freesignCount().subscribe((res) => {
      if (res["status"] === "success") {
        this.freeSignCount = res['data'].freesigncount ? res['data'].freesigncount : 0;
        const items = this.userService.cartData.filter(
          (item) => item.premiumHandleType === "Free"
        );
        if (this.freeSignCount + items.length > 9) {
          this.serverErrorMessages =
            "Sorry you are limited to "+ this.utilityService.freeAtSign +" free @signs. You can have unlimited premium @signs.";
          return;
        }
        this.isCalculatingAtsign = true;
        this.recalculateChoices();
        this.selectionError = "";
        // this.interstitialLoaderService.show({ svg: 'alien', message: 'Negotiating with alien invaders…' });
        this.userService.selectHandle.atsignName = "";
        this.atsignNameError = false;
        if (this.disableCompute) {
          return;
        }
        let arraytoCheck = {};

        var dataArray = {};
        dataArray["colors"] = this.userService.selectHandle.colors;
        dataArray["animals"] = this.userService.selectHandle.animals;
        dataArray["numbers"] = this.userService.selectHandle.numbers;
        dataArray["foods"] = this.userService.selectHandle.foods;
        dataArray["hobbies"] = this.userService.selectHandle.hobbies;
        dataArray["movies"] = this.userService.selectHandle.movies;
        dataArray["music"] = this.userService.selectHandle.music;
        dataArray["sports"] = this.userService.selectHandle.sports;

        this.freeHandlesLabels.forEach((key) => {
          arraytoCheck[key] = dataArray[key];
        });

        this.checkAtsignAvailability(
          {
            atsignType: "free",
            arrayTocheck: arraytoCheck,
            inviteCode: this.inviteCode,
          },
          (res) => {
            this.serverErrorMessages = "";
            if (res) {
              if(res['status'] === 'error')
              {
                this.serverErrorMessages = res['message'];
              }
              this.userService.selectHandle.atsignName = res["atsignName"];
              if (
                this.userService.atSignSearchHistory.length ===
                this.utilityService.searchHistoryCount
              ) {
                this.userService.atSignSearchHistory.splice(0, 1);
              }
              if (
                this.userService.atSignSearchHistory.indexOf(
                  this.userService.selectHandle.atsignName
                ) === -1
              ) {
                this.userService.atSignSearchHistory.push(
                  this.userService.selectHandle.atsignName
                );
              }
              this.handleNotAvailable = false;
              this.isCalculatingAtsign = false;
            } else {
              this.serverErrorMessages =
                "Link has been used or this @sign is not available anymore, please update your selection"; //this.computeHandle();
              this.isCalculatingAtsign = false;
            }
          }
        );
      } else {
        this.serverErrorMessages =
          "Sorry you are limited to "+ this.utilityService.freeAtSign +" free @signs. You can have unlimited premium @signs.";
      }
    });
  }

  generateRandomHandle(initial) {
    this.atsignNameError = false;
    this.userService.selectHandle.atsignName = "";
    this.freeHandlesLabels = [...this.userService.standardHandlesLabels];
    this.standardHandlesPlaceHolder = [];
    this.emptyIndex = [0, 1, 2, 3];
    var dataArray = {};
    var randomNumber = Math.floor(Math.random() * 15);
    dataArray["colors"] = this.choices["colors"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["animals"] = this.choices["animals"][randomNumber];
    randomNumber = Math.floor(Math.random() * 100);
    dataArray["numbers"] = this.choices["numbers"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["hobbies"] = this.choices["hobbies"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["movies"] = this.choices["movies"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["music"] = this.choices["music"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["sports"] = this.choices["sports"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    dataArray["foods"] = this.choices["foods"][randomNumber];

    let mixitupCount = Math.floor(Math.random() * initial) + 1;

    if (initial) {
      this.allfreeHandles = shuffle(this.allfreeHandles);
      for (let i = 0; i < mixitupCount; i++) {
        this.emptyIndex.shift();
        if (this.freeHandlesLabels.indexOf(this.allfreeHandles[i]) === -1) {
          this.freeHandlesLabels[i] = this.allfreeHandles[i];
          this.standardHandlesPlaceHolder.push(this.allfreeHandles[i]);
        } else {
          this.freeHandlesLabels[i] = this.allfreeHandles[i + 1];
          this.standardHandlesPlaceHolder.push(this.allfreeHandles[i + 1]);
        }
      }
    }

    this.userService.selectHandle.foods = dataArray["foods"];
    this.userService.selectHandle.colors = dataArray["colors"];
    this.userService.selectHandle.animals = dataArray["animals"];
    this.userService.selectHandle.numbers = dataArray["numbers"];
    this.userService.selectHandle.hobbies = dataArray["hobbies"];
    this.userService.selectHandle.movies = dataArray["movies"];
    this.userService.selectHandle.music = dataArray["music"];
    this.userService.selectHandle.sports = dataArray["sports"];
    this.checkComputeDisable();
  }

  recalculateChoices() {
    var dataArray = {};
    var randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.colors = this.choices["colors"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.animals = this.choices["animals"][
      randomNumber
    ];
    randomNumber = Math.floor(Math.random() * 100);
    this.userService.selectHandle.numbers = this.choices["numbers"][
      randomNumber
    ];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.hobbies = this.choices["hobbies"][
      randomNumber
    ];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.movies = this.choices["movies"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.music = this.choices["music"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.sports = this.choices["sports"][randomNumber];
    randomNumber = Math.floor(Math.random() * 15);
    this.userService.selectHandle.foods = this.choices["foods"][randomNumber];
  }

  checkAtsignAvailability(atsignName, callback) {
    this.userService.checkAtsignAvailability(atsignName).subscribe(
      (res) => {
        if (!res) {
          callback({'status':'error','message':'Something went wrong. Please try again later.'});
        }
        else if (res["status"] === "success") {
          callback(res["data"]);
        } else {
          callback(false);
        }
      },
      (err) => {
        this.serverErrorMessages =
          "Something went wrong. Please contact admin.";
        callback(false);
      }
    );
  }

  checkComputeDisable() {
    let customArray = [];
    this.standardHandlesPlaceHolder.forEach((value) => {
      customArray.push(this.userService.selectHandle[value]);
    });
    customArray = customArray.filter((n) => n);
    this.disableCompute = false;
    //Dont need to stop custumization if no filter is selcted
    // if(customArray.length === 0){
    //     this.disableCompute = true;
    // }
    // else{
    //     this.disableCompute = false;
    // }
  }

  changeFreeHandles(option) {
    let lengthUsed = this.standardHandlesPlaceHolder.length;
    let indexOfExisting = this.freeHandlesLabels.indexOf(option);
    if (indexOfExisting === -1) {
      if (lengthUsed >= 2) {
        let index = this.freeHandlesLabels.findIndex(
          (e) => e == this.standardHandlesPlaceHolder[0]
        );
        this.freeHandlesLabels[index] = "Topic " + (index + 1);
        this.standardHandlesPlaceHolder.splice(0, 1);
        this.emptyIndex.push(index);
        this.emptyIndex.sort();
        let indexTouse = this.emptyIndex.shift();
        this.freeHandlesLabels[indexTouse] = option;
        this.standardHandlesPlaceHolder.push(option);
        this.checkComputeDisable();
      } else {
        this.emptyIndex.sort();
        let indexTouse = this.emptyIndex.shift();
        this.freeHandlesLabels[indexTouse] = option;
        this.standardHandlesPlaceHolder[lengthUsed] = option;
        this.checkComputeDisable();
      }
    } else {
      this.freeHandlesLabels[indexOfExisting] =
        "Topic " + (indexOfExisting + 1);
      let ind = this.standardHandlesPlaceHolder.indexOf(option);
      this.standardHandlesPlaceHolder.splice(ind, 1);
      this.emptyIndex.push(indexOfExisting);
      this.emptyIndex.sort();
      this.checkComputeDisable();
    }
  }
  async register() {
    if (this.userService.selectHandle.atsignName && this.email) {
      this.userService
        .updateReserveAtsign({
          atsignName: this.userService.selectHandle.atsignName,
          type: "timestamp",
        })
        .subscribe(
          (res) => {
            this.router.navigateByUrl("/account-verify/" + this.inviteCode);
            this.userService.timeLeft = this.userService.defaultTimeLeft;
          },
          (err) => {
            this.serverErrorMessages = "Bummer! This @sign is not available anymore!";
          }
        );
    } else if (this.userService.selectHandle.atsignName && !this.email) {
      this.userService
        .updateReserveAtsign({
          atsignName: this.userService.selectHandle.atsignName,
          type: "timestamp",
        })
        .subscribe(
          (res) => {
            this.router.navigateByUrl(
              "/account-verify/" + this.friendInviteCode
            );
            this.userService.timeLeft = this.userService.defaultTimeLeft;
          },
          (err) => {
            this.serverErrorMessages = "Bummer! This @sign is not available anymore!";
          }
        );
    } else {
      this.atsignNameError = true;
    }
  }
  async addToCart(form: NgForm) {
    const items = this.userService.cartData.filter(
      (item) => item.premiumHandleType === "Free"
    );
    if (this.freeSignCount + items.length > this.utilityService.freeAtSign - 1) {
      this.serverErrorMessages =
        "Sorry you are limited to "+ this.utilityService.freeAtSign +" free @signs. You can have unlimited premium @signs.";
      return;
    }
    this.interstitialLoaderService.show({
      svg: "addbag",
      message: "Adding to bag…",
    });
    this.userService.showTimer = false;
    var data = {
      atsignName: this.userService.selectHandle.atsignName,
      premiumHandleType: "Free",
      payAmount: 0,
    };

    this.userService
      .updateReserveAtsign({
        atsignName: this.userService.selectHandle.atsignName,
        cart: this.userService.cartData,
        type: "timestamp",
      })
      .subscribe(
        (res) => {
          this.userService.cartData.push(data);
          this.userService.selectHandle.subTotal += this.userService.selectHandle.payAmount;
          this.userService.selectHandle.atsignName = "";
          this.userService.showTimer = true;
          this.userService.timeLeft = this.userService.defaultTimeLeft;
          setTimeout(() => {
            this._snackBar.open(
                "@sign added to cart.",
                "x",
                {
                  duration: 5000,
                  panelClass: ["custom-snackbar"],
                }
              );
          }, 3000);
        },
        (err) => {
          // this.atsignSuccessMessage = '';
          this.serverErrorMessages = "Bummer! This @sign is not available anymore!";
        }
      );
    console.log(this.userService.cartData);
  }
  clearFilters() {
    this.standardHandlesPlaceHolder = [];
    this.freeHandlesLabels = [...this.userService.standardHandlesLabels];
    this.emptyIndex = [0, 1, 2, 3];
    this.selectionError = "";
  }
}

//The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
