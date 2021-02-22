import { CommissionService } from "src/app/shared/services/commission.service"

export class CommissionReport {
    atsign: string
    createdAt: Date
    finalCommission: number
    orderAmount: number
    atsignDetails : Object[]
    totalNoOfTransactions : number
    paidAmount: number

    constructor(data) {

        this.atsign = data.atsign;
        this.createdAt = data.createdAt
        this.finalCommission = data.finalCommission
        this.orderAmount = data.orderAmount
        this.atsignDetails = Object.keys(data.orderData.atsignDetails).map((key) =>  {
            return { key , noOfAtsigns : data.orderData.atsignDetails[key]}
        })

        this.totalNoOfTransactions = this.atsignDetails.reduce(function(accumulator, currentValue: any, currentIndex, array) {
            return accumulator + currentValue.noOfAtsigns
        }, 0)
    }
}


