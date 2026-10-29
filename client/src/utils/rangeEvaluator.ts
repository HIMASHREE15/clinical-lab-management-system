import { ITestParameter } from '../types';

export const rangeEvaluator = (
  valueStr: string,
  paramDef?: ITestParameter
): 'NORMAL' | 'ABNORMAL_HIGH' | 'ABNORMAL_LOW' | 'CRITICAL' => {
  if (!valueStr || !paramDef) return 'NORMAL';

  const numVal = parseFloat(valueStr);

  if (!isNaN(numVal)) {
    if (paramDef.minRef !== undefined && numVal < paramDef.minRef) {
      if (paramDef.minRef > 0 && numVal < paramDef.minRef * 0.5) return 'CRITICAL';
      return 'ABNORMAL_LOW';
    }
    if (paramDef.maxRef !== undefined && numVal > paramDef.maxRef) {
      if (numVal > paramDef.maxRef * 1.5) return 'CRITICAL';
      return 'ABNORMAL_HIGH';
    }
  } else {
    if (paramDef.expectedValue) {
      if (valueStr.toLowerCase() !== paramDef.expectedValue.toLowerCase()) {
        if (valueStr.toLowerCase().includes('positive')) return 'ABNORMAL_HIGH';
        return 'ABNORMAL_HIGH';
      }
    }
  }

  return 'NORMAL';
};
