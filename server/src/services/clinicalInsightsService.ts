import { IResultParameterValue } from '../types';
import { MEDICAL_DISCLAIMER } from '../config/constants';

export interface ClinicalInsightResult {
  observations: string[];
  disclaimer: string;
  hasAbnormalities: boolean;
}

export const generateClinicalInsights = (parameters: IResultParameterValue[]): ClinicalInsightResult => {
  const observations: string[] = [];
  let hasAbnormalities = false;

  for (const param of parameters) {
    if (param.flag === 'ABNORMAL_HIGH') {
      hasAbnormalities = true;
      observations.push(
        `Informational: '${param.parameterName}' value (${param.resultValue} ${param.unit}) is elevated above normal reference range (${param.referenceRange}). Recommend physician correlation.`
      );
    } else if (param.flag === 'ABNORMAL_LOW') {
      hasAbnormalities = true;
      observations.push(
        `Informational: '${param.parameterName}' value (${param.resultValue} ${param.unit}) is below normal reference range (${param.referenceRange}). Recommend physician correlation.`
      );
    } else if (param.flag === 'CRITICAL') {
      hasAbnormalities = true;
      observations.push(
        `Critical Flag: '${param.parameterName}' reading (${param.resultValue} ${param.unit}) is significantly outside reference limits (${param.referenceRange}). Priority physician review advised.`
      );
    }
  }

  if (!hasAbnormalities) {
    observations.push('All evaluated laboratory parameters fall within expected normal reference intervals.');
  }

  return {
    observations,
    disclaimer: MEDICAL_DISCLAIMER,
    hasAbnormalities,
  };
};
