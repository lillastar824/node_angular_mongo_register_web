export interface AtsignDetail {
    atsignCreatedOn: string
    atsignName: string
    atsignType: string
    expiringSoon: boolean
    inviteCode: string
    inviteLink: string
    isActivated: number
    activationTime: Date
    isPayable: boolean
    payAmount: number
    premiumAtsignType: string
    renewalDate: string
    _id: string
    atsignDetailObj : {
      advanceDetails : {
        domain: string
        port : number
      }
    }
  }
