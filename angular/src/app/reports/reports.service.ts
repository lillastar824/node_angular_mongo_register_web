import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor(private http: HttpClient) { }

    convertToCSV(objArray) {
        let total = 0;
        var array = (typeof objArray != 'object') ? JSON.parse(objArray) : objArray;
        var str = '';
        let atsignName='';
        let email='';
        let contact='';
        let userStatus='';
        let payAmount='';
        let premiumAtsignType='';
        let atsignType='';
        let atsignCreatedOn='';
        let line='';
        array.forEach(function(val,key){
            line = '';
            for (let [key1, value] of Object.entries(val)) {
                line += value + ','
            }
            if (parseInt(val['payAmount'])) {
                total = total + parseInt(val['payAmount']);
            }
                str += line + '\r\n';
        })
        // for (var i = 0; i < array.length; i++) {
        //      atsignName = array[i].atsignName || '';
        //      email = array[i].email || '';
        //      contact = array[i].contact || '';
        //      userStatus = array[i].userStatus || '';
        //      payAmount=array[i].payAmount || '';
        //      premiumAtsignType = array[i].premiumAtsignType || '';
        //      atsignType = array[i].atsignType || '';
        //      atsignCreatedOn =array[i].atsignCreatedOn || '';
        //     line = atsignName + ',' + email + ',' + contact + ',' + userStatus + ',' + payAmount + ',' + premiumAtsignType + ',' + atsignType + ',' + atsignCreatedOn;
        //     // line = (atsignName?atsignName + ',':'') + (email ? email + ',':'') + (contact?contact + ',':'') + (userStatus?userStatus + ',':'') + (payAmount?payAmount + ',':'') + (premiumAtsignType?premiumAtsignType + ',':'') + (atsignType?atsignType + ',':'') + (atsignCreatedOn?atsignCreatedOn:'');
        //     str += line + '\r\n';
        //     if(parseInt(payAmount)){
        //         total = total + parseInt(payAmount); 
        //     }
        // }
        if(total>0){
            line = '"","",Total:,'+total;
            str+=line;
        }
       
        return str;
    };
    exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

       // //console.log(jsonObject);

        var csv = this.convertToCSV(jsonObject);

        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}