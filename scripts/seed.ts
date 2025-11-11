import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting data seed...");

  // Read JSON
  const filePath = path.join(__dirname, "../../..", "data", "Analytics_Test_Data.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const inv of jsonData.invoices || jsonData) {
    // 1️⃣ Vendor
    let vendor = await prisma.vendor.findFirst({
      where: { name: inv.vendor?.name || "Unknown Vendor" },
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          name: inv.vendor?.name || "Unknown Vendor",
          email: inv.vendor?.email || null,
          phone: inv.vendor?.phone || null,
        },
      });
    }

    // 2️⃣ Customer
    let customer = await prisma.customer.findFirst({
      where: { name: inv.customer?.name || "Unknown Customer" },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: inv.customer?.name || "Unknown Customer",
          email: inv.customer?.email || null,
        },
      });
    }

    // 3️⃣ Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: inv.number || "INV-" + Math.floor(Math.random() * 10000),
        vendorId: vendor.id,
        customerId: customer.id,
        date: inv.date ? new Date(inv.date) : new Date(),
        dueDate: inv.due_date ? new Date(inv.due_date) : null,
        status: inv.status || "pending",
        currency: inv.currency || "USD",
        subtotal: inv.subtotal || 0,
        tax: inv.tax || 0,
        total: inv.total || 0,
      },
    });

    // 4️⃣ Line Items
    if (Array.isArray(inv.line_items)) {
      for (const item of inv.line_items) {
        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description || "Item",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            total: item.total || 0,
          },
        });
      }
    }

    // 5️⃣ Payments
    if (Array.isArray(inv.payments)) {
      for (const p of inv.payments) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: p.amount || 0,
            method: p.method || "unknown",
            date: p.date ? new Date(p.date) : new Date(),
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
