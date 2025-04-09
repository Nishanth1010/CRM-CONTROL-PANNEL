import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, LeadStatus } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = parseInt(params.companyId);

  if (isNaN(companyId)) {
    return NextResponse.json({ message: 'Invalid company ID.' }, { status: 400 });
  }

  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: 'File is required.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any); // Cast buffer to 'any' to resolve type mismatch
    const worksheet = workbook.worksheets[0];

    const rows: Record<string, string>[] = [];
    const headers: string[] = worksheet.getRow(1).values as string[];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const rowData: Record<string, string> = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value ? cell.value.toString() : 'NA';
      });
      rows.push(rowData);
    });

    const validPriorities = ['low', 'medium', 'high'];
    const defaultPriority = 'medium';
    const defaultStatus: LeadStatus = LeadStatus.NEW;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const {
        name,
        email,
        phone,
        designation = 'NA',
        companyName = 'NA',
        place = 'NA',
        sourceName = 'NA',
        employeeName = 'NA',
        description = 'NA',
        status = defaultStatus,
        priority = defaultPriority,
        nextFollowupDate = null,
      } = row;

      try {
        if (!name || !phone) {
          throw new Error('Missing required fields: name or phone.');
        }

        const leadPriority = validPriorities.includes(priority.toLowerCase())
          ? priority.toLowerCase()
          : defaultPriority;

        const leadStatus: LeadStatus = Object.values(LeadStatus).includes(status.toUpperCase() as LeadStatus)
          ? (status.toUpperCase() as LeadStatus)
          : defaultStatus;

        const source = await prisma.source.findFirst({
          where: {
            source: sourceName,
            companyId,
          },
        });
        const sourceId = source ? source.id : null;

        const employee = await prisma.employee.findFirst({
          where: {
            name: employeeName,
            companyId,
          },
        });
        const employeeId = employee ? employee.id : null;

        await prisma.lead.create({
          data: {
            name,
            email: email !== 'NA' ? email : null,
            phone: phone.toString(),
            designation: designation !== 'NA' ? designation : null,
            companyId,
            companyName: companyName !== 'NA' ? companyName : null,
            place: place !== 'NA' ? place : null,
            sourceId,
            employeeId,
            description: description !== 'NA' ? description : null,
            status: leadStatus,
            priority: leadPriority,
            nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : new Date(),
          },
        });
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ message: 'Bulk upload completed with errors.', errors }, { status: 400 });
    }

    return NextResponse.json({ message: 'Bulk upload successful.' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
