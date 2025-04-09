import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { Readable } from "stream";

const prisma = new PrismaClient();


export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = Number(params.companyId);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { success: false, message: "Invalid company ID." },
        { status: 400 }
      );
    }

    const type = searchParams.get("type");
    if (!type || !["lead", "followup"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid type. Type must be 'lead' or 'follow-up'." },
        { status: 400 }
      );
    }

    // Extract and parse filters
    const employeeId = searchParams.get("employeeId") ? Number(searchParams.get("employeeId")) : undefined;
    const productId = searchParams.get("productId") ? Number(searchParams.get("productId")) : undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const today = searchParams.get("today");

    // Define the base query filter
    const where: any = { companyId };

    // Handle date filtering logic
    const getDateRange = (start: string | null, end: string | null) => {
      if (start && end) {
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);

        return { gte: startOfDay, lte: endOfDay };
      }
      return undefined;
    };

    const todayDateRange = today
      ? getDateRange(today, today)
      : getDateRange(startDate, endDate);

    if (todayDateRange) {
      where.nextFollowupDate = todayDateRange;
    }

    if (type === "lead") {
      // Lead-specific filters
      if (employeeId) where.employeeId = employeeId;
      if (productId) {
        where.products = {
          some: { id: productId },
        };
      }
      if (status) where.status = status;

      // Fetch leads
      const leads = await prisma.lead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employee: true,
          products: true,
        },
      });

      // Generate and return Excel file for leads
      return await generateExcelFile(leads, "leads");
    } else if (type === "followup") {
      // Follow-up specific filters
      if (employeeId) {
        where.lead = { employeeId };
      }

      // Fetch follow-ups
      const followUps = await prisma.followup.findMany({
        where: {
          nextFollowupDate: todayDateRange, // Apply date filter at the top level
          lead: {
            // Additional filters for the lead relation
            companyId,
            ...(employeeId ? { employeeId } : {}), // Add employee filter if present
          },
        },
        orderBy: { [sortBy]: sortOrder },
        include: {
          lead: {
            include: {
              employee: true, // Include employee details from the lead
            },
          },
        },
      });
      

      // Generate and return Excel file for follow-ups
      return await generateExcelFile(followUps, "follow-ups");
    } else {
      return NextResponse.json(
        { success: false, message: "Unhandled type. Something went wrong." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { success: false, message: "Error generating report", error: error.message },
      { status: 500 }
    );
  }
}

  

async function generateExcelFile(data: any[], type: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type === "leads" ? "Leads Report" : "Follow-ups Report");

  // Define columns for the Excel sheet
  if (type === "leads") {
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Company Name", key: "companyName", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Next Follow-up Date", key: "nextFollowupDate", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];
  } else {
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Lead ID", key: "leadId", width: 10 },
      { header: "Last Requirement", key: "lastRequirement", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Next Follow-up Date", key: "nextFollowupDate", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];
  }

  // Add data to the worksheet
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Create a buffer and send the response as an Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${type}-report.xlsx`,
    },
  });
}
