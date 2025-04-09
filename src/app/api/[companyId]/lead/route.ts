import { NextRequest, NextResponse } from 'next/server';
import { LeadStatus, PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';


const prisma = new PrismaClient();

// Helper for pagination
function getPagination(page: number, limit: number) {
  // Ensure page is at least 1
  page = Math.max(page, 1);
  const offset = (page - 1) * limit;
  return { offset, limit };
}

// CREATE a new lead (POST)
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const companyId = Number(params.companyId);
    const {
      name,
      email,
      phone,
      companyName,
      employeeId,
      productIds,
      status,
      priority,
      designation,
      description,
      nextFollowupDate,
      place,
      sourceId,
    } = await req.json();

    // Validation: Ensure all required fields are provided
    if (!name || !phone || !place || !sourceId) {
      return NextResponse.json({ success: false, message: 'Required fields are missing' }, { status: 400 });
    }

    // Calculate nextFollowupDate (3 days from now if null)
    const calculatedNextFollowupDate = nextFollowupDate
      ? new Date(nextFollowupDate)
      : new Date(new Date().setDate(new Date().getDate() + 3));

    // Create a new lead associated with the company
    const newLead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone,
        employee: {
          connect: { id: employeeId },
        },
        designation: designation,
        description,
        status,
        companyName,
        priority,
        place,
        source: {
          connect: { id: sourceId },
        },
        nextFollowupDate: calculatedNextFollowupDate,
        products: {
          connect: productIds?.map((id: number) => ({ id })) || [],
        },
        company: {
          connect: { id: companyId },
        },
      },
      include: {
        employee: true, // Include employee details to get their email
        products: true, // Include product details for the email
      },
    });

    // Send email to the assigned employee
    if (!newLead.employee?.email) {
      return NextResponse.json({ success: false, message: 'Employee email not found' }, { status: 500 });
      }
      const productNames = newLead.products.length
      ? newLead.products.map((product) => product.name).join(', ')
      : "No specific products assigned";
    
    const emailSubject = `New Lead Assigned: ${newLead.name}`;
    
    const emailText = `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f3f3f3; padding: 30px; margin: 0;">
    <div style="max-width: 600px; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); margin: auto;">
      
      <h2 style="color: #2c3e50; margin-bottom: 15px;">Dear <strong>${newLead.employee.name}</strong>,</h2>
      
      <p style="font-size: 16px; color: #444;">
        A new lead <strong style="color: #d9534f;">${newLead.name}</strong> has been assigned to you.
      </p>
      
      <div style="background: #f8f9fa; padding: 15px; border-left: 5px solid #007bff; border-radius: 8px; margin-top: 15px;">
        <p style="margin: 0; font-size: 16px;">
          <strong style="color: #007bff;">Products:</strong> ${productNames}
        </p>
      </div>

      <p style="font-size: 16px; margin-top: 20px;">
        Please follow up at your earliest convenience.
      </p>

      <div style="margin-top: 20px;">
        <a href="https://crm.idzone.app/dashboard/follow-ups/my-follow-ups" 
           style="color: #ffffff; background-color: #28a745; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          View Follow-ups
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        Thanks,<br>
        <strong style="color: #333;">TEAM XY-CRM</strong>
      </p>
    </div>
  </body>
</html>
`;

    
    const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"XY-CRM" <${process.env.SMTP_USER}>`,
          to: newLead.employee?.email ,
          subject: emailSubject,
          html:emailText,
        };

        await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Lead created successfully', data: newLead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ success: false, message: 'Error creating lead' }, { status: 500 });
  }
}

// READ leads with filters, sorting, and pagination (GET)
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = Number(params.companyId);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const { offset } = getPagination(page, limit);

    const employeeId = searchParams.get('employeeId');
    const statusParam = searchParams.get('status'); // e.g. "new,in_progress"
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const today = searchParams.get('today');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const searchQuery = searchParams.get('search');
    const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null;
    const priorityFilter = searchParams.get('priority');  // Get the priority filter value from query params
    const sourceId = searchParams.get('sourceId');  // New source filter

    const where: any = { companyId };

    if (employeeId) {
      where.employeeId = Number(employeeId);
    }

    // ✅ Map statusParam to LeadStatus enums
    if (statusParam) {
      const statusList = statusParam.split(',').map((s) => s.trim().toLowerCase());

      const validStatuses = statusList.map((s) => {
        switch (s) {
          case 'new':
            return LeadStatus.NEW;
          case 'in_progress':
            return LeadStatus.IN_PROGRESS;
          case 'customer':
            return LeadStatus.CUSTOMER;
          case 'rejected':
            return LeadStatus.REJECTED;
          default:
            return null;
        }
      }).filter(Boolean);

      if (validStatuses.length === 1) {
        where.status = validStatuses[0];
      } else if (validStatuses.length > 1) {
        where.status = { in: validStatuses };
      }
    }

    // Add priority filter to the query if provided
    if (priorityFilter) {
      where.priority = priorityFilter;  // Ensure we apply the priority filter here
    }

    if (productId) {
      where.products = {
        some: {
          id: { in: [productId] },
        },
      };
    }

    if (sourceId) {
      where.sourceId = Number(sourceId);  // Apply sourceId filter
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.nextFollowupDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (today) {
      const startOfRange = new Date(today);
      startOfRange.setDate(startOfRange.getDate() - 30);
      startOfRange.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      where.nextFollowupDate = {
        gte: startOfRange,
        lte: endOfToday,
      };
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { phone: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { products: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } },
        { employee: { name: { contains: searchQuery, mode: 'insensitive' } } },
        { company: { name: { contains: searchQuery, mode: 'insensitive' } } },
        {
          source: {
            source: { contains: searchQuery, mode: 'insensitive' },
          },
        },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: [
        { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },  // Sorting based on the order
        { priority: sortOrder === 'asc' ? 'asc' : 'desc' },  // Apply priority sorting as well
        { status: sortOrder === 'asc' ? 'asc' : 'desc' },
      ],
      skip: offset,
      take: limit,
      include: {
        employee: true,
        company: {
          select: {
            id: true,
            name: true,
            licenseCount: true,
          },
        },
        products: true,
        source: true,
      },
    });

    const totalLeads = await prisma.lead.count({ where });

    return NextResponse.json(
      {
        success: true,
        data: leads,
        total: totalLeads,
        page,
        totalPages: Math.ceil(totalLeads / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, message: 'Error fetching leads' }, { status: 500 });
  }
}



export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  const companyId = Number(params.companyId);

  if (!leadId) {
    return NextResponse.json({ success: false, message: 'Lead ID is required' }, { status: 400 });
  }

  try {
    // Parse request JSON and destructure required fields
    const {
      name,
      email,
      phone,
      status,
      place,
      companyName,
      priority,
      designation,
      description,
      nextFollowupDate,
      employeeId,
      productIds,
      sourceId,
    }: {
      name: string;
      email?: string;
      phone: string;
      status: 'NEW' | 'IN_PROGRESS' | 'CUSTOMER' | 'REJECTED';
      priority: string;
      place: string;
      designation?: string;
      description?: string;
      companyName?: string;
      nextFollowupDate?: string;
      employeeId?: number;
      productIds?: number[];
      sourceId?: string;
    } = await req.json();

    // Validate required fields
    if (!name || !phone || !status || !priority || !sourceId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Check if the lead exists and belongs to the correct company
    const existingLead = await prisma.lead.findFirst({
      where: { id: Number(leadId), companyId },
      include: { products: true, employee: true, source: true }, // Include products, employee, and source
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found or does not belong to your company' },
        { status: 404 }
      );
    }

    // Determine which products to connect and disconnect
    const currentProductIds = existingLead.products.map((product) => product.id);
    const productsToConnect = productIds?.filter((id) => !currentProductIds.includes(id)) || [];
    const productsToDisconnect = currentProductIds.filter((id) => !productIds?.includes(id));

    // Fetch related employee and source details if they are provided
    let employeeDetails = null;
    if (employeeId) {
      employeeDetails = await prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (!employeeDetails) {
        return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
      }
    }

    let sourceDetails = null;
    if (sourceId) {
      sourceDetails = await prisma.source.findUnique({
        where: { id: Number(sourceId) },
      });
      if (!sourceDetails) {
        return NextResponse.json({ success: false, message: 'Source not found' }, { status: 404 });
      }
    }

    // Update the lead with provided data, including products, employee, and source
    const updatedLead = await prisma.lead.update({
      where: { id: Number(leadId) },
      data: {
        name,
        email,
        phone,
        status,
        place,
        priority,
        companyName,
        designation: designation ?? existingLead.designation, // Only update if provided
        description: description ?? existingLead.description, // Only update if provided
        nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : existingLead.nextFollowupDate, // Only update if provided
        employeeId: employeeId ?? existingLead.employeeId, // Update employee if provided
        sourceId: sourceId ? Number(sourceId) : existingLead.sourceId, // Only update if provided
        products: {
          connect: productsToConnect.map((id) => ({ id })), // Connect new products
          disconnect: productsToDisconnect.map((id) => ({ id })), // Disconnect removed products
        },
      },
      include: { products: true, employee: true, source: true }, // Fetch related details
    });

    return NextResponse.json(
      { success: true, message: 'Lead updated successfully', data: updatedLead },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ success: false, message: (error as Error).message || 'An error occurred while updating the lead' }, { status: 500 });
  }
}


// DELETE a lead (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  const companyId = Number(params.companyId);

  try {
    if (!leadId) {
      return NextResponse.json({ success: false, message: 'Lead ID is required' }, { status: 400 });
    }

    // Delete related follow-ups first
    await prisma.followup.deleteMany({
      where: { leadId: Number(leadId) },
    });

    // Now delete the lead
    await prisma.lead.delete({
      where: { id: Number(leadId) },
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, message: 'Error deleting lead' }, { status: 500 });
  }
}

