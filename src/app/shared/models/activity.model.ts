export class Activity {
    constructor(public userId: number,
                public text: string,
                public before: any,
                public after: any,
                public itemType: string,
                public itemId: number,
                public timestamp: number) {
    }
}

export class ActivitySimple {
    constructor(public text: string, public timestamp: number){
    }
}

