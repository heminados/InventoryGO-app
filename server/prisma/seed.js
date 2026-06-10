import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// ─── Users ────────────────────────────────────────────────────────────────────

const adminUser = {
    name: 'Adir Halay',
    email: 'halayadir@gmail.com',
    password: '1862',
    role: 'ADMIN',
};

const employeeUsers = [
    { name: 'Sarah Mitchell', email: 'sarah.mitchell@inventorygo.com', password: 'employee123', role: 'EMPLOYEE' },
    { name: 'James Carter',   email: 'james.carter@inventorygo.com',   password: 'employee123', role: 'EMPLOYEE' },
    { name: 'Priya Sharma',   email: 'priya.sharma@inventorygo.com',   password: 'employee123', role: 'EMPLOYEE' },
    { name: 'Tom Bennett',    email: 'tom.bennett@inventorygo.com',     password: 'employee123', role: 'EMPLOYEE' },
    { name: 'Nina Voss',      email: 'nina.voss@inventorygo.com',       password: 'employee123', role: 'EMPLOYEE' },
];

// ─── Items ────────────────────────────────────────────────────────────────────

const items = [
    // Electronics
    { sku: 'ELEC-001', name: 'Dell Laptop 15"',           description: '15.6" FHD display, Intel i5, 16GB RAM, 512GB SSD', price: 849.99,  qty: 12, is_ordered: false },
    { sku: 'ELEC-002', name: 'LG 27" Monitor',            description: '27" IPS panel, 4K UHD, USB-C connectivity',        price: 349.99,  qty: 8,  is_ordered: false },
    { sku: 'ELEC-003', name: 'Mechanical Keyboard',       description: 'Tenkeyless, Cherry MX Brown switches, backlit',     price: 129.99,  qty: 25, is_ordered: false },
    { sku: 'ELEC-004', name: 'Wireless Mouse',            description: 'Ergonomic design, 2.4GHz, up to 18 months battery', price: 49.99,   qty: 30, is_ordered: false },
    { sku: 'ELEC-005', name: 'USB-C Hub 7-Port',          description: '7-in-1 hub: HDMI, 3x USB-A, SD card, PD charging', price: 59.99,   qty: 20, is_ordered: false },
    // Office
    { sku: 'OFFC-001', name: 'Ergonomic Office Chair',    description: 'Lumbar support, adjustable armrests, mesh back',    price: 299.99,  qty: 6,  is_ordered: false },
    { sku: 'OFFC-002', name: 'Standing Desk 60"',         description: 'Electric height adjustment, 60"x30" surface',       price: 499.99,  qty: 4,  is_ordered: true  },
    { sku: 'OFFC-003', name: 'HP LaserJet Printer',       description: 'Monochrome laser, 30ppm, duplex printing, Wi-Fi',   price: 249.99,  qty: 3,  is_ordered: false },
    { sku: 'OFFC-004', name: 'A4 Copy Paper (500 sheets)', description: '80gsm, acid-free, compatible with all printers',   price: 9.99,    qty: 100, is_ordered: false },
    { sku: 'OFFC-005', name: 'Whiteboard 4x3ft',          description: 'Magnetic surface, includes tray and 4 markers',     price: 89.99,   qty: 5,  is_ordered: false },
    // Accessories
    { sku: 'ACCS-001', name: 'HDMI Cable 2m',             description: 'HDMI 2.0, supports 4K@60Hz, gold-plated connectors', price: 14.99,  qty: 40, is_ordered: false },
    { sku: 'ACCS-002', name: 'USB-C to USB-A Adapter',    description: 'USB 3.0, 5Gbps transfer speed, compact form',       price: 12.99,   qty: 35, is_ordered: false },
    { sku: 'ACCS-003', name: 'Webcam 1080p',              description: 'Full HD 30fps, built-in mic, plug-and-play USB',     price: 79.99,   qty: 15, is_ordered: false },
    { sku: 'ACCS-004', name: 'Laptop Stand Aluminium',    description: 'Adjustable height, foldable, supports up to 17"',   price: 44.99,   qty: 18, is_ordered: false },
    { sku: 'ACCS-005', name: 'Noise Cancelling Headset',  description: 'Active noise cancellation, 30h battery, USB-C',     price: 199.99,  qty: 10, is_ordered: true  },
    // Storage
    { sku: 'STRG-001', name: 'SSD 1TB External',          description: 'USB 3.2, up to 1050MB/s read, shock-resistant',     price: 99.99,   qty: 14, is_ordered: false },
    { sku: 'STRG-002', name: 'USB Flash Drive 64GB',      description: 'USB 3.0, compact cap-less design, 130MB/s read',    price: 19.99,   qty: 50, is_ordered: false },
    { sku: 'STRG-003', name: 'NAS Drive 4TB',             description: '3.5" SATA, 7200 RPM, optimised for NAS enclosures', price: 149.99,  qty: 7,  is_ordered: false },
    // Peripherals
    { sku: 'PRPH-001', name: 'Document Scanner A4',       description: 'Duplex ADF, 30ppm, USB & Wi-Fi, TWAIN compatible',  price: 189.99,  qty: 4,  is_ordered: false },
    { sku: 'PRPH-002', name: 'Portable Projector',        description: '1080p, 500 ANSI lumens, HDMI/USB-C, built-in speaker', price: 349.99, qty: 3, is_ordered: true  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Seeding database...');

    // ── 1. Users ──────────────────────────────────────────────────────────────

    const adminHash = await bcrypt.hash(adminUser.password, SALT_ROUNDS);
    const admin = await prisma.user.upsert({
        where:  { email: adminUser.email },
        update: {},
        create: {
            name:     adminUser.name,
            email:    adminUser.email,
            password: adminHash,
            role:     adminUser.role,
        },
    });
    console.log(`  Admin:     ${admin.name} (${admin.email})`);

    const seededEmployees = [];
    for (const emp of employeeUsers) {
        const hash = await bcrypt.hash(emp.password, SALT_ROUNDS);
        const user = await prisma.user.upsert({
            where:  { email: emp.email },
            update: {},
            create: {
                name:     emp.name,
                email:    emp.email,
                password: hash,
                role:     emp.role,
            },
        });
        seededEmployees.push(user);
        console.log(`  Employee:  ${user.name} (${user.email})`);
    }

    // ── 2. Items ──────────────────────────────────────────────────────────────

    for (const item of items) {
        await prisma.item.upsert({
            where:  { sku: item.sku },
            update: { name: item.name, description: item.description },
            create: item,
        });
    }
    console.log(`  Items:     ${items.length} records upserted`);

    // ── 3. Tasks ──────────────────────────────────────────────────────────────
    // Tasks have no natural unique key — skip if any already exist.

    const existingTaskCount = await prisma.task.count();
    if (existingTaskCount > 0) {
        console.log(`  Tasks:     skipped (${existingTaskCount} already exist)`);
    } else {
        const now = new Date('2026-05-21');
        const day = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

        const taskData = [
            {
                title:       'Audit warehouse stock levels',
                description: 'Perform a full physical count of all items and reconcile with system records.',
                assigned_to: seededEmployees[0].id,
                created_by:  admin.id,
                status:      'IN_PROGRESS',
                due_date:    day(5),
            },
            {
                title:       'Reorder low-stock electronics',
                description: 'Check ELEC-* SKUs below threshold and raise purchase orders.',
                assigned_to: seededEmployees[1].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(3),
            },
            {
                title:       'Update item pricing for Q3',
                description: 'Review supplier invoices and update prices for OFFC and PRPH categories.',
                assigned_to: seededEmployees[2].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(10),
            },
            {
                title:       'Label new accessories shipment',
                description: 'Unbox, label, and enter the new ACCS shipment into the system.',
                assigned_to: seededEmployees[3].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(2),
            },
            {
                title:       'Verify storage SKU alignment',
                description: 'Confirm STRG-001 through STRG-003 SKUs match physical shelf labels.',
                assigned_to: seededEmployees[4].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(7),
            },
            {
                title:       'Prepare monthly inventory report',
                description: 'Compile movement data and stock levels into the monthly summary report.',
                assigned_to: seededEmployees[0].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(14),
            },
            {
                title:       'Check printer paper stock',
                description: 'Ensure OFFC-004 stock is sufficient for office needs for the next 30 days.',
                assigned_to: seededEmployees[1].id,
                created_by:  seededEmployees[0].id,
                status:      'DONE',
                due_date:    day(-2),
            },
            {
                title:       'Set up new employee workstation',
                description: 'Allocate ELEC-001 laptop, ELEC-002 monitor, and ELEC-003 keyboard for new hire.',
                assigned_to: seededEmployees[2].id,
                created_by:  admin.id,
                status:      'IN_PROGRESS',
                due_date:    day(1),
            },
            {
                title:       'Inspect returned headsets',
                description: 'Check returned ACCS-005 units for damage and update is_ordered status.',
                assigned_to: seededEmployees[3].id,
                created_by:  seededEmployees[1].id,
                status:      'OPEN',
                due_date:    day(4),
            },
            {
                title:       'Document standing desk installation',
                description: 'Record the OFFC-002 installation details and update asset register.',
                assigned_to: seededEmployees[4].id,
                created_by:  admin.id,
                status:      'DONE',
                due_date:    day(-5),
            },
            {
                title:       'Organize cable inventory',
                description: 'Sort and count ACCS-001 and ACCS-002 cables, group by type.',
                assigned_to: seededEmployees[0].id,
                created_by:  seededEmployees[2].id,
                status:      'OPEN',
                due_date:    day(6),
            },
            {
                title:       'Review projector booking log',
                description: 'Confirm PRPH-002 availability and update is_ordered flag accordingly.',
                assigned_to: seededEmployees[1].id,
                created_by:  admin.id,
                status:      'CANCELLED',
                due_date:    day(-1),
            },
            {
                title:       'Backup NAS drive data',
                description: 'Verify STRG-003 units are functioning and run a backup verification.',
                assigned_to: seededEmployees[2].id,
                created_by:  admin.id,
                status:      'OPEN',
                due_date:    day(8),
            },
        ];

        await prisma.task.createMany({ data: taskData });
        console.log(`  Tasks:     ${taskData.length} records created`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
