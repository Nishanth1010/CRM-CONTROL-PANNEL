import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = parseInt(params.companyId);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
  }

  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const employeeId = url.searchParams.get("employeeId");

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await prisma.employee.findMany({
      where: {
        companyId: companyId,
        ...(employeeId && { id: parseInt(employeeId) }),
      },
    });

    const reportData = await Promise.all(
      employees.map(async (employee) => {
        const totalFollowups = await prisma.followup.count({
          where: {
            lead: {
              employeeId: employee.id,
              companyId: companyId,
            },
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });

        const contactedToday = await prisma.followup.count({
          where: {
            lead: {
              employeeId: employee.id,
              companyId: companyId,
            },
            nextFollowupDate: today,
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        const pendingToday = await prisma.followup.count({
          where: {
            lead: {
              employeeId: employee.id,
              companyId: companyId,
            },
            nextFollowupDate: today,
            NOT: {
              createdAt: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          },
        });

        return {
          EmployeeName: employee.name,
          TotalFollowup: totalFollowups,
          ContactedToday: contactedToday,
          PendingToday: pendingToday,
        };
      })
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Follow-Up Report");

    worksheet.columns = [
      { header: "Employee Name", key: "EmployeeName", width: 20 },
      { header: "Total Follow-Up", key: "TotalFollowup", width: 15 },
      { header: "Contacted Today", key: "ContactedToday", width: 18 },
      { header: "Pending Today", key: "PendingToday", width: 15 },
    ];

    reportData.forEach((data) => worksheet.addRow(data));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=FollowUpReport_${companyId}.xlsx`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
