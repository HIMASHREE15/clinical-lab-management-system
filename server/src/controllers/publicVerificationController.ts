import { Request, Response } from 'express';
import { dbStore } from '../services/dataStore';

export const verifyPublicReport = async (req: Request, res: Response) => {
  const { reportId } = req.params;

  const sample = dbStore.getSamples().find(
    (s) => s.sampleId === reportId || `RPT-${s.sampleId}` === reportId || s._id === reportId
  );

  if (!sample) {
    return res.status(404).json({
      success: false,
      message: 'Report verification failed. No record matching this Report ID was found in the central registry.',
      verified: false,
    });
  }

  const result = dbStore.findResultBySampleId(sample.sampleId);

  return res.json({
    success: true,
    verified: sample.status === 'RELEASED' || sample.status === 'DELIVERED',
    reportDetails: {
      reportId: `RPT-${sample.sampleId}`,
      sampleId: sample.sampleId,
      laboratoryName: 'City Clinical Laboratory',
      testName: sample.testName,
      patientInitials: sample.patientName ? `${sample.patientName.charAt(0)}***` : 'P***',
      collectedAt: sample.collectedAt,
      releasedAt: result?.releasedAt || result?.createdAt || new Date(),
      status: sample.status,
      verifiedByPathologist: result?.verifiedByDoctorName || 'Dr. Karthik MD',
      isDigitallySigned: result?.isVerifiedByDoctor || false,
    },
  });
};
