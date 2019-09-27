import SensitiveWithoutStep from './sensitiveWithoutStep';
import SensitiveWithStep from './sensitiveWithStep';

interface SwhpConstructor {
  keywords: Array<string>;
  replacement?: string;
  step?: number;
}

class SensitiveWordHelp {
  static default: any;
  constructor(obj: SwhpConstructor) {
    const { keywords, step, replacement } = obj;

    if (step !== undefined && step) {
      return new SensitiveWithStep(obj);
    } else {
      return new SensitiveWithoutStep(obj);
    }
  }
}

SensitiveWordHelp.default = SensitiveWordHelp;

export = SensitiveWordHelp;
