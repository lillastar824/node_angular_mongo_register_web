import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gift-up-card',
  templateUrl: './gift-up-card.component.html',
  styleUrls: ['./gift-up-card.component.css']
})
export class GiftUpCardComponent implements OnInit {

  constructor() { 
    (function (g, i, f, t, u, p, s) { g[u] = g[u] || function() { (g[u].q = g[u].q || []).push(arguments) }; p = i.createElement(f); p.async = 1; p.src = t; s = i.getElementsByTagName(f)[0]; s.parentNode.insertBefore(p, s); })(window, document, "script", "https://cdn.giftup.app/dist/gift-up.js", "giftup"); 
  }

  ngOnInit() {

  }

}
