import { CommissionService } from "src/app/shared/services/commission.service";

export interface CommissionRevenue {
    currency: string
    status: string
    totalCommissionPaid: number
    totalFinalCommission: number
    totalOrderAmount: number
    _id: string
}

export class CommissionRevenueSnapshot {

    currentEarnings: number;
    pendingPayout: number;
    lifetimeEarnings: number;

    constructor(data : CommissionService[]) {
        this.currentEarnings = data.reduce((accumulator, currentValue: any, currentIndex, array) => {
            return accumulator + currentValue.totalCommissionPaid
        }, 0)

        this.lifetimeEarnings = data.reduce((accumulator, currentValue: any, currentIndex, array) => {
            return accumulator + currentValue.totalFinalCommission
        }, 0)

        this.pendingPayout = this.lifetimeEarnings - this.currentEarnings
    }

}