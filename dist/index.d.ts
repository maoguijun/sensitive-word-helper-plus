interface SwhpConstructor {
    keywords: Array<string>;
    replacement?: string;
    step?: number;
}
declare class SensitiveWordHelp {
    static default: any;
    constructor(obj: SwhpConstructor);
}
export = SensitiveWordHelp;
