import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';
import { generateClinicalInsights } from '../services/clinicalInsightsService';
import { generateLabReportPDF } from '../services/pdfService';
import { IResult, IResultParameterValue } from '../types';
import { getPatientForUser, isPatientOwner } from '../utils/patientAccess';
import { ROLES } from '../config/constants';

export const getResultBySampleId = async (req: AuthRequest, res: Response) => {
  const { sampleId } = req.params;
  const result = dbStore.findResultBySampleId(sampleId);

  if (!result) {
    return res.status(404).json({ success: false, message: 'Result not found for this sample' });
  }

  if (req.user && !(await isPatientOwner(req.user, result.patientId))) {
    return res.status(404).json({ success: false, message: 'Result not found for this sample' });
  }
  if (req.user?.role === ROLES.PATIENT && !result.releasedAt) {
    return res.status(404).json({ success: false, message: 'Result not found for this sample' });
  }

  return res.json({ success: true, result });
};

export const saveResult = async (req: AuthRequest, res: Response) => {
  const {
    sampleId,
    entryMethod,
    parameters,
    technicianRemarks,
    testDate,
    isDraft,
    uploadedReportUrl,
    uploadedReportFileName,
    uploadedReportFileType,
    uploadedReportFileSize,
  } = req.body;

  if (!sampleId) {
    return res.status(400).json({ success: false, message: 'Sample ID is required' });
  }

  const sample = dbStore.findSampleById(sampleId);
  if (!sample) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  const isFileUpload = entryMethod === 'FILE_UPLOAD';

  if (!isFileUpload && (!parameters || !Array.isArray(parameters))) {
    return res.status(400).json({ success: false, message: 'Sample ID and valid parameters array are required for manual entry' });
  }

  if (isFileUpload && !uploadedReportUrl && !uploadedReportFileName) {
    return res.status(400).json({ success: false, message: 'Please select a report file to upload' });
  }

  const validParams: IResultParameterValue[] = Array.isArray(parameters) ? parameters : [];

  // Generate Informational Clinical Insights if parameters are present
  const insightsData = validParams.length > 0
    ? generateClinicalInsights(validParams)
    : {
        observations: isFileUpload
          ? [`Laboratory evaluation report uploaded by technician: ${uploadedReportFileName || 'attached document'}. Awaiting pathologist verification.`]
          : [],
      };

  const newResult: IResult = {
    _id: `res-${Date.now()}`,
    sampleId: sample.sampleId,
    patientId: typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)._id,
    patientName: sample.patientName,
    testName: sample.testName,
    entryMethod: isFileUpload ? 'FILE_UPLOAD' : 'MANUAL',
    parameters: validParams,
    technicianRemarks: technicianRemarks || '',
    testDate: testDate ? new Date(testDate) : new Date(),
    isDraft: Boolean(isDraft),
    uploadedReportUrl: uploadedReportUrl || '',
    uploadedReportFileName: uploadedReportFileName || '',
    uploadedReportFileType: uploadedReportFileType || '',
    uploadedReportFileSize: uploadedReportFileSize || 0,
    isVerifiedByDoctor: false,
    downloadCount: 0,
    clinicalInsights: insightsData.observations,
    createdAt: new Date(),
  };

  dbStore.saveResult(newResult);

  // If submitted (not draft), auto transition sample status to RESULT_GENERATED so it enters doctor verification queue
  if (!isDraft && sample.status !== 'RELEASED' && sample.status !== 'DELIVERED') {
    dbStore.updateSample(sample.sampleId, {
      status: 'RESULT_GENERATED',
      timeline: [
        ...sample.timeline,
        {
          status: 'RESULT_GENERATED',
          label: 'Result Generated',
          timestamp: new Date(),
          updatedBy: req.user?.name || 'Lab Tech',
          location: 'Lab Analysis Terminal',
          remarks: technicianRemarks || (isFileUpload ? `Laboratory report file uploaded: ${uploadedReportFileName}` : 'Results recorded and submitted for doctor verification'),
        },
      ],
    });
  }

  dbStore.addAuditLog({
    user: req.user?.name || 'Technician',
    role: req.user?.role || 'Lab Tech',
    action: isDraft ? 'SAVE_RESULT_DRAFT' : 'SAVE_TEST_RESULT',
    resource: sample.sampleId,
    details: isDraft
      ? `Saved draft result for sample ${sample.sampleId} (${isFileUpload ? 'File Upload' : 'Manual Entry'})`
      : `Submitted test result for sample ${sample.sampleId} (${isFileUpload ? 'File Upload' : 'Manual Entry'})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({
    success: true,
    result: newResult,
    insights: insightsData,
    isDraft: Boolean(isDraft),
    message: isDraft ? 'Draft saved successfully.' : 'Test result submitted for verification.',
  });
};

export const verifyResult = async (req: AuthRequest, res: Response) => {
  const { sampleId } = req.params;
  const { doctorNotes, releaseImmediately } = req.body;

  const result = dbStore.findResultBySampleId(sampleId);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Result record not found' });
  }

  const sample = dbStore.findSampleById(sampleId);
  if (!sample) {
    return res.status(404).json({ success: false, message: 'Associated sample record not found' });
  }

  result.isVerifiedByDoctor = true;
  result.verifiedByDoctorName = req.user?.name || 'Dr. Karthik MD';
  result.verifiedAt = new Date();
  if (doctorNotes) result.doctorNotes = doctorNotes;
  if (releaseImmediately) result.releasedAt = new Date();

  dbStore.saveResult(result);

  const nextStatus = releaseImmediately ? 'RELEASED' : 'DOCTOR_VERIFIED';

  dbStore.updateSample(sample.sampleId, {
    status: nextStatus,
    timeline: [
      ...sample.timeline,
      {
        status: nextStatus,
        label: nextStatus === 'RELEASED' ? 'Released' : 'Doctor Verification',
        timestamp: new Date(),
        updatedBy: req.user?.name || 'Consulting Pathologist',
        location: 'Pathologist Workstation',
        remarks: doctorNotes || 'Verified and approved result',
      },
    ],
  });

  dbStore.addAuditLog({
    user: req.user?.name || 'Doctor',
    role: req.user?.role || 'Doctor',
    action: 'VERIFY_TEST_RESULT',
    resource: sample.sampleId,
    details: `Doctor approved result for sample ${sample.sampleId}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, result, sampleStatus: nextStatus });
};

export const downloadReportPDF = async (req: AuthRequest, res: Response) => {
  const { sampleId } = req.params;
  const sample = dbStore.findSampleById(sampleId);
  if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });

  const samplePatientId = typeof sample.patientId === 'string' ? sample.patientId : sample.patientId._id;
  if (req.user && !(await isPatientOwner(req.user, samplePatientId))) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  const result = dbStore.findResultBySampleId(sample.sampleId);
  if (!result) return res.status(404).json({ success: false, message: 'Result not generated yet' });
  if (req.user?.role === ROLES.PATIENT && !result.releasedAt) {
    return res.status(404).json({ success: false, message: 'Result is not released yet' });
  }

  const patient = await dbStore.findPatientById(typeof sample.patientId === 'string' ? sample.patientId : sample.patientId._id) || {
    _id: 'pat-default',
    patientId: 'PT1000',
    name: sample.patientName,
    age: 30,
    gender: 'Female',
    contact: '+1 555-000-0000',
    createdAt: new Date(),
  };

  try {
    const pdfBuffer = await generateLabReportPDF(sample, result, patient);

    // Increment download count
    result.downloadCount = (result.downloadCount || 0) + 1;
    dbStore.saveResult(result);

    dbStore.addAuditLog({
      user: req.user?.name || 'User',
      role: req.user?.role || 'User',
      action: 'DOWNLOAD_LAB_REPORT_PDF',
      resource: sample.sampleId,
      details: `Downloaded official PDF report for sample ${sample.sampleId}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=LabReport_${sample.sampleId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ success: false, message: 'Error rendering PDF report' });
  }
};

export const getAllResults = async (req: AuthRequest, res: Response) => {
  const results = dbStore.getResults();
  return res.json({ success: true, count: results.length, results });
};

export const getPatientTrends = async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params;
  let targetPatientId = patientId;
  if (req.user?.role === 'Patient') {
    const patient = await getPatientForUser(req.user);
    if (!patient || (patientId !== patient._id && patientId !== patient.patientId && patientId !== 'me')) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    const results = dbStore.getResults().filter((result) =>
      (result.patientId === patient._id || result.patientId === patient.patientId) && Boolean(result.releasedAt)
    );
    return res.json({ success: true, count: results.length, results });
  }
  const results = dbStore.getResults().filter((result) =>
    result.patientId === targetPatientId
  );
  return res.json({ success: true, count: results.length, results });
};
