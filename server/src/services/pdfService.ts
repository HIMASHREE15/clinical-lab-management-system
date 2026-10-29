import PDFDocument from 'pdfkit';
import { ISample, IResult, IPatient } from '../types';
import { MEDICAL_DISCLAIMER } from '../config/constants';

export const generateLabReportPDF = (
  sample: ISample,
  result: IResult,
  patient: IPatient
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Banner
      doc
        .fillColor('#6d28d9')
        .rect(40, 40, 515, 60)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CITY CLINICAL LABORATORY', 55, 55);

      doc
        .fontSize(9)
        .font('Helvetica')
        .text('123 Health Care Street, Medical Zone, Cityville | Phone: +1 (800) 555-LABS', 55, 80);

      // Report Header Box
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .rect(40, 115, 515, 80)
        .stroke();

      doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
      doc.text('PATIENT DEMOGRAPHICS', 50, 125);
      doc.text('ORDER & SAMPLE METADATA', 300, 125);

      doc.fontSize(9).font('Helvetica').fillColor('#475569');
      doc.text(`Patient Name: ${patient.name}`, 50, 142);
      doc.text(`Patient ID: ${patient.patientId}`, 50, 156);
      doc.text(`Age / Gender: ${patient.age} Yrs / ${patient.gender}`, 50, 170);

      doc.text(`Sample ID: ${sample.sampleId}`, 300, 142);
      doc.text(`Test Name: ${sample.testName}`, 300, 156);
      doc.text(`Collection Date: ${new Date(sample.collectedAt).toLocaleDateString()}`, 300, 170);

      // Parameter Results Table Header
      let y = 215;
      doc.fillColor('#f1f5f9').rect(40, y, 515, 25).fill();

      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
      doc.text('PARAMETER', 50, y + 8);
      doc.text('RESULT', 200, y + 8);
      doc.text('UNIT', 300, y + 8);
      doc.text('REFERENCE INTERVAL', 380, y + 8);
      doc.text('STATUS', 490, y + 8);

      y += 30;

      // Table Rows
      if (result.parameters && result.parameters.length > 0) {
        for (const param of result.parameters) {
          doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
          doc.text(param.parameterName, 50, y);
          doc.text(param.resultValue, 200, y);
          doc.text(param.unit || '-', 300, y);
          doc.text(param.referenceRange || '-', 380, y);

          if (param.flag === 'NORMAL') {
            doc.fillColor('#16a34a').text('NORMAL', 490, y);
          } else if (param.flag === 'CRITICAL') {
            doc.fillColor('#dc2626').font('Helvetica-Bold').text('CRITICAL', 490, y);
          } else {
            doc.fillColor('#d97706').font('Helvetica-Bold').text('ABNORMAL', 490, y);
          }

          y += 20;
          doc.strokeColor('#f1f5f9').moveTo(40, y - 5).lineTo(555, y - 5).stroke();
        }
      } else {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#4338ca');
        doc.text('LABORATORY REPORT ATTACHED AS DIGITAL DOCUMENT', 50, y);
        y += 18;
        doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
        doc.text(`Uploaded Document File: ${result.uploadedReportFileName || 'Official Lab Document'}`, 50, y);
        y += 25;
      }

      y += 15;

      // Notes & Observations Box
      doc.fillColor('#faf5ff').rect(40, y, 515, 65).fill();
      doc.strokeColor('#e9d5ff').rect(40, y, 515, 65).stroke();

      doc.fillColor('#6d28d9').fontSize(9).font('Helvetica-Bold');
      doc.text('CLINICAL OBSERVATIONS & REMARKS', 50, y + 8);
      doc.fillColor('#334155').font('Helvetica').fontSize(8);
      const obsText = result.clinicalInsights?.join(' ') || 'All parameters evaluated standard.';
      doc.text(obsText, 50, y + 22, { width: 495 });

      y += 80;

      // Signatures
      doc.strokeColor('#cbd5e1').moveTo(50, y + 30).lineTo(200, y + 30).stroke();
      doc.strokeColor('#cbd5e1').moveTo(350, y + 30).lineTo(500, y + 30).stroke();

      doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
      doc.text('TECHNOLOGIST SIGNATURE', 50, y + 35);
      doc.text('CONSULTING PATHOLOGIST', 350, y + 35);
      doc.font('Helvetica').fillColor('#64748b');
      doc.text('Verified Digital Cert #8849', 50, y + 47);
      doc.text('Dr. Sarah Jenkins, MD Path.', 350, y + 47);

      // Disclaimer Footer
      doc
        .fontSize(7)
        .font('Helvetica-Oblique')
        .fillColor('#94a3b8')
        .text(MEDICAL_DISCLAIMER, 40, 780, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
