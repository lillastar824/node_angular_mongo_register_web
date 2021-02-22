import { Injectable } from '@angular/core';
import emojiRegexFunction from 'emoji-regex';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {
    public emojiRegex;
    atSignTypeObject: object = { 'custom': 'Custom', 'reserved': 'Reserved', 'threeChar': 'Three Character', 'singleWord': 'Single Word', 'free': 'Free' }
    searchHistoryCount: number = 5;
    freeAtSign = 10;


constructor() {
    // this.emojiRegex = emojiRegexFunction();
 }

//The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
    shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    checkEmailValid(email) {
        const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        return emailRegex.test(email);
    } 
    checkAtsignValid(atsign) {
        return true;
    }
    checkMobileValid(contact) {
        contact = contact.replace(/ /g,'');
        const contactRegex = /^\+[1-9]\d{9,11}$/;
        return contactRegex.test(contact);
    }

    nltobr (str) {
        const breakTag = '<br>';
        return String(str).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    atSignWithEmojiLength(inputStr) {
        let nonEmojiLength = inputStr.replace(emojiRegexFunction(), '').length;
        let emojiLength = inputStr.match(emojiRegexFunction()) && inputStr.match(emojiRegexFunction()).length;
        return nonEmojiLength + emojiLength;
    }
    getPremiumAtsignType(amount) {
        if (amount === 5000) {
            return 'Three Character';
        } else if (amount === 1000) {
            return 'Single Word';
        } else if (amount === 100) {
            return 'Custom';
        } else {
            return 'Reserved';
        }
    }

    contactUglify(contact) {
        return contact.replace(/\D/g, '');
    }
    checkNameValid(from){ 
         const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
         return nameRegex.test(from);
          }
}
