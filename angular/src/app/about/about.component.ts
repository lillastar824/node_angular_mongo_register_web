import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {BottomSheetComponent} from '../bottom-sheet/bottom-sheet.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit {
    teamMembers: any = [
        {
            "name": "Barbara Tallent",
            "email": "barbara@atsign.com",
            "description": "We founded The @ Company based on respect for people and their privacy. We believe that privacy is not an impediment to commerce and that companies can have much better interactions with their customers   and serve them much better when they respect their privacy. We also believe that this shift to a new  way of doing business can be both fun and profitable for all involved. We hope you join our journey!",
            "image": "barbara_tallent.jpg",
            "atsign": "barbara",
            "linkedin": "barbaratallent"
        },
        {
            "name": "Kevin Nickels",
            "email": "kevin@atsign.com",
            "description": "The @ Company represents the embodiment of a passion of mine that I have been pondering for more than a decade - technology that empowers individuals to control their digital selves. I view this as a vitally important solution needed to address some of society’s most vexing problems.",
            "image": "kevin_nickels.jpg",
            "atsign": "kevin",
            "linkedin": "kevin-nickels-9aa"
        },
        {
            "name": "Colin Constable",
            "email": "colin@atsign.com",
            "description": "I am one of the founders of The @ Company for a simple reason: we are solving a problem that is hidden in plain sight. We all put up with the poor user experiences of the internet today. Why? Because the new internet is only going to be obvious once you have had the new experiences that the @ protocol will bring.",
            "image": "colin_constable.jpg",
            "atsign": "colin",
            "linkedin": "colinconstable"
        },
        {
            "name": "Venkat Raju",
            "email": "venkat@atsign.com",
            "description": "I believe in the @ Company’s mission to remove friction and enable trust in our online digital pursuits, thus unlocking unrealized economic value. Specifically, self-owned identity systems that enable a new set of experiences while empowering users and businesses to have total control over their data.",
            "image": "venkat_raju.jpg",
            "atsign": "",
            "linkedin": "venkatraju"
        },
        {
            "name": "Denise Daniels",
            "email": "denise@atsign.com",
            "description": "Innovation, the first of it’s kind, a big change, and providing consumers with what they really want and need — that’s why I’m at The @ Company. I’m excited to be part of a really cool ground floor team so that everyone can own our data, our digital identities, and live a more private, simple and stress free Internet life. I hope you join our mission, sign-up for your @sign and help create The IofP (The Internet of People).",
            "image": "denise_daniels.jpg",
            "atsign": "denisedaniels",
            "linkedin": "denise-daniels-5010441"
        },
        {
            "name": "Rocky Tilney",
            "email": "",
            "description": "Creating new brands and working with teams to develop exciting new products is one of my passions. I have worked on dozens of product launches and branding projects over the years—there is nothing quite like what The @ Company is building. I’m excited to be part of the team that is designing solutions to give people back control and ownership of their online data. This is a game changer!",
            "image": "rocky_tilney.jpg",
            "atsign": "rocky",
            "linkedin": "rockytilney"
        },
        {
            "name": "Jagannadh Vanguri",
            "email": "",
            "description": "I am Jagannadh. I am a developer on this project. I truly believe we are up to something really phenomenal here.",
            "image": "jaggan_vanguri.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Sreedhar Tulluri",
            "email": "",
            "description": "Managing expectations, at home and at work.",
            "image": "sreedhar_tulluri.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Naresh Gurijala",
            "email": "",
            "description": "I like to build things. Great to be part of this wonderful team. Watch out we are going to change internet for ever.",
            "image": "naresh_gurijala.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Murali Dharan",
            "email": "",
            "description": "I believe privacy is a fundamental right of every internet user and the @ company will help the community in solving privacy concerns. I am truly excited to be a part of the dream team.",
            "image": "murali_dharan.jpg",
            "atsign": "",
            "linkedin": "murali25"
        },
        {
            "name": "Sitaram Kalluri",
            "email": "",
            "description": "With @sign, you truly own your data. An innovation that brings in a new dimension to data privacy and data sharing in the internet world. Pleasure being a part of this team.",
            "image": "sitaram_kalluri.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Alan Dong",
            "email": "",
            "description": "I am a rising junior at the University of Southern California majoring in Math and Economics, with a minor in the Cinematic Arts. In my spare time, I run, play the guitar, and invest in stocks with an investment fund. I love the art, culture, and especially the music of the 60’s.",
            "description1": "I love the trust that the founders put in their interns to conduct our own work and pursue our passions.",
            "image": "alan_dong.jpg",
            "atsign": "",
            "linkedin": ""
        },       
        {
            "name": "Angelo Reyes",
            "email": "",
            "description": "I am a rising senior at San Francisco State University studying computer science. I have been coding since my senior year in high school. Aside from coding, I am also a DII athlete for my university.",
            "description1": "What I love most about working for the @ Company is the freedom to work on projects that we are interested in and seeing how much impact our apps could possibly make.",
            "image": "angelo_reyes.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Dany Itani",
            "email": "",
            "description": "I am a student at UC Berkeley studying computer science with a passion in computer security and data science.",
            "description1": "I love that the @founders have already been working in a remote setting, so the internship has been quite smooth. I also really enjoy working in an agile development environment as a software engineer myself!",
            "image": "dany_itani.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Derek Tucker-Peters",
            "email": "",
            "description": "I have always had a passion for math and science, which eventually led to me getting involved in robotics, the initial inspiration for my interest in coding. Since acknowledging my interest in programming I have taken to learning more about it, and the opportunity to work at the @ Company is amazing for helping me grow as a coder. Currently at The @ Company, I am working with a couple other interns on a chat app as well as a social media app.",
            "description1": " I love working for the @ Company because everyone I am working with is very nice and everyone tries to help each other out. It's also great to be a part of a startup and contribute by helping to create an app for the protocol.",
            "image": "derek_tucker-peters.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Dylan TerMolen",
            "email": "",
            "description": "I am a Computer Engineering student at Vanderbilt University. I enjoy working on technical problems that involve multiple disciplines of engineering. In my free time I love watching soccer, solving crosswords, and watching movies.",
            "description1": "I love working for the @ Company because I feel proud that I am working on something that will actually better the world while also facing immense technical challenges.",
            "image": "dylan_termolen.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Esther Kao",
            "email": "",
            "description": "Majoring in English and Cognitive Science, I'm a recent UC Berkeley graduate with a knack for mashing words together, usually to dramatic effect. In recent years, I've interned in communications for a Bay Area-based book festival, handled social media for a popular web novelist, and volunteered at a clinical psychology research lab. My hope is to eventually intertwine my writing capabilities with my passion for decreasing stigma around mental health.",
            "description1": "Waking up at 9AM everyday! (Just kidding). I truly believe that what makes or breaks a work experience is the people you're working with. And for me, The @ Company team is a joy to work with — they're wholly committed, relentlessly innovative, and just great people with great humor. Despite being industry professionals with 30+ years of experience, they treat the interns as equals, which allows us to really take ownership of the work we're doing here.",
            "image": "esther_kao.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Hakeem Awbrey",
            "email": "",
            "description": "I graduated officially from the University of Texas at Austin with a BS in advertising. I’m the Co-Founder of Expressivespace. I’m passionate about talking and can talk for days. I have 3 hairless cats and 2 dogs and I love them more than anything.",
            "description1": "I love the freedom and support we get from the founders. Usually in school everything is so rigid with a set outcome, with the @company I can explore my ideas that will grow the company. I feel like the company actually believes in us interns.",
            "image": "hakeem_awbrey.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Malachi Butterfield",
            "email": "",
            "description": "I am the lead developer of a new upcoming app for smartphones. With the use of The @ Company’s networking feature, this app helps provide connectivity to devices that can't access cellular or Wi-Fi services. It does this by allowing users to send and receive signals from another user’s device, which creates a network that grows as more users join. While on the network users can share news, messages, files, app updates, and so on.",
            "description1": "I love the @ Company's overall system of work, everything is open, you don’t have to work alone, ideas and processes are shared which can support one another. The diversity of various skills is remarkably large allowing everyone to bring their own to the table. But most of all everyone has the passion and love for the company’s goals, which prove everyone is performing their all and then some!!! ",
            "image": "malachi_butterfield.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Mohamed Sudheer",
            "email": "",
            "description": "I'm a rising sophomore at UC Berkeley studying Computer Science. I love viewing the world through a technological lens, which is why I am passionate about solving problems through technology. With that being said, I believe data privacy is the greatest challenge Internet users are facing today as our lives become more intertwined with cyberspace. Working for the @ Company has given me a unique opportunity to tackle this problem firsthand.",
            "description1": "What I love most about the @ Company is how open everyone is to collaboration. The daily work atmosphere is filled with positivity and the founders encourage everyone to push themselves in a healthy manner.",
            "image": "mohamed_sudheer.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Samantha Latimer",
            "email": "",
            "description": "I am a rising senior at the University of Colorado at Boulder, pursuing a Bachelor’s degree in Media Studies and a minor in Journalism. I am passionate about connecting with people, learning new things, music, and exploring. I love all things marketing and media, and embrace new challenges as often as I can.",
            "description1": " I love how supportive and encouraging the entire @ Company team is. It is so empowering to know that all of our ideas and opinions matter, and that we are all working together towards a common goal. Beyond this, it has been amazing to work for a company where everyone cares about you as a person, not just as an employee.",
            "image": "samantha_latimer.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Sean Kim",
            "email": "",
            "description": "I am an undergraduate student at University of California, San Diego, pursuing a degree in Math-Computer Science.",
            "description1": "I am excited to learn and grow during this internship and it is great that I get to take part in changing the Internet!",
            "image": "sean_kim.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Tyler McNierney",
            "email": "",
            "description": "I am an undergraduate at University of California, Berkeley pursuing a degree in Electrical Engineering and Computer Science. What drew me to the @ Company was its simple yet rare message: providing internet services transparently, devoid of any ulterior motives and fueled entirely by good-natured spirit and passion. It is a great privilege to help change the world with this incredible organization.",
            "description1": "The @ Company has provided its interns with a unique atmosphere of camaraderie, good-humor, and effable passion that I doubt can be found in sizable corporations or even other startups. Work feels less like work and more like fun that drives the company forward. The @ Company most certainly knows how to develop its startup culture!",
            "image": "tyler_mcnierney.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Tyler Trott",
            "email": "",
            "description": "I reside in my home country of Bermuda and am currently enrolled in the Bachelor of Science (Honors), Data Science program at the University of Ontario Institute of Technology. Before this internship with The @ Company, I was interning as the Survey and Census Database Clerk at the Bermuda Government's Department of Statistics where I was able to apply both my Statistical as well as my Computer Science knowledge. For The @ Company, I am within the planning and design phase of an external software development project that will allow for a more efficient on-boarding experience for both hiring companies.",
            "description1": "I really enjoy the supportive atmosphere that all of the team members produce. It allows for a comfortable, working environment that results in extraordinary work.",
            "image": "tyler_trott.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Tyrese Coakley",
            "email": "",
            "description": "I am a third year Business student from Bermuda, majoring in marketing at the University of New Brunswick, NB, CA. As a Marketing and Business Development intern for the @ Company I've had the opportunity thus far to work very closely with the founders on a competitive analysis project, looking at possible competition and potential partners in our market. In addition to this, I'm also assisting with the development of the investor material used to pitch for company funding. Being a part of this startup process already has proven to be an extremely educational and beneficial experience for me and I hope to continue learning and growing alongside the other great interns. I plan to use the skills I've developed to further my career in marketing, as well as to better manage my education non-profit, Nexus Bermuda.",
            "description1": "Being a part of this startup process has already proven to be an extremely educational and beneficial experience for me, and I hope to continue learning and growing alongside the other great interns. I love the elements of comradery, challenge-oriented thinking, and lightheartedness that exists in The @ Company, these traits are rare and but make a great internship.",
            "image": "tyrese_coakley.png",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Utkarsh Raj",
            "email": "",
            "description": "I am Utkarsh, a pre-final year engineering student currently pursuing my bachelors in Electronics and Communication Engineering from LNMIIT Jaipur.",
            "description1": " I truly believe that the @ protocol will completely change how we interact on the internet. We will own our data and our identity, and everything will be permission based.",
            "image": "utkarsh_raj.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Zar'a Cardell",
            "email": "",
            "description": "I have been teaching school children in Bermuda how to code since 2016. By bringing programming and software development into their minds, I can show them how fun and entertaining it can be to create things out of nothing with code. My biggest interest currently is machine learning, and my goal is to find a career in data science and AI. With The @ Company I am planning to create an app that will help Bermudian small businesses stay up-to-date with data privacy compliance by making use of the @ protocol and some other useful tools I plan to implement.",
            "description1": "What I love most about working for The @ Company is the overall environment, they are very supportive and I think their hands-off management style really allows for creative approaches to problem solving.",
            "image": "zara_cardell.jpg",
            "atsign": "",
            "linkedin": ""
        },
        {
            "name": "Zara Francis-Roban",
            "email": "",
            "description": "I'm a graphic design student at Ryerson University in Toronto, with experience in branding, logo design, UI and UX design. I'm interested in building a strong and enticing public image for a brand. At The @ Company I'm working on producing graphic design work and media content for the company that will help get out the message about the @ protocol and the importance of internet privacy.",
            "description1": "What I love most about working at The @ Company is helping to visualize the innovative and creative ideas with the interns I work alongside.",
            "image": "zara_francis-roban.jpg",
            "atsign": "",
            "linkedin": ""
            }
    ];
    showDesc: any = [];
    leftProperty: any = '0%';
    constructor(public dialog: MatDialog,private _bottomSheet: MatBottomSheet) {

    }

    ngOnInit() {
        // for (let i = 0; i < this.teamMembers.length; i++) {
        //     this.showDesc.push(false);
        // }
    }
    showDescription(index) {
        // for (let i = 0; i < this.teamMembers.length; i++) {
        //     this.showDesc[i] = false;
        // }
        // this._bottomSheet.open(BottomSheetComponent,{
        //     data:  this.teamMembers[index] ,
        //   });
          const dialogRef = this.dialog.open(BottomSheetComponent, {
            data: {data: this.teamMembers[index]},
            panelClass: 'custom-modalbox'
          });
      
          dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            // this.animal = result;
          });
        // if ([0, 4, 8, 12].indexOf(index) !== -1) {
        //     this.leftProperty = '0%';
        // } else if ([1, 5, 9, 13].indexOf(index) !== -1) {
        //     this.leftProperty = '-121%';
        // } else if ([2, 6, 10, 14].indexOf(index) !== -1) {
        //     this.leftProperty = '-238%';
        // } else if ([3, 7, 11, 15].indexOf(index) !== -1) {
        //     this.leftProperty = '-356%';
        // }
        // this.showDesc[index] = !this.showDesc[index];
    }
}
