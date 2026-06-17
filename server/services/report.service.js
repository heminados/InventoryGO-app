import prisma from '../config/prisma.js';

// Reports reuse the existing Report model (no schema change). The extra audit
// fields the UI needs — action, status, source app, details, exception reason,
// and which item was touched — are stored as a JSON string in `description`.
// createReport() writes that JSON; getAllReports() reads it back into a flat
// object the frontend can render directly.

export const createReport = async ({
    issued_by,
    action,
    status = 'NORMAL',          // 'NORMAL' | 'EXCEPTION'
    source = 'client',          // 'admin' | 'client'
    details = '',
    exception_reason = '',
    item = null,                // the affected item, used to record its sku/name
}) => {
    const meta = {
        action,
        status,
        source,
        details,
        exception_reason,
        item_sku: item?.sku || '',
        item_name: item?.name || '',
    };
    return prisma.report.create({
        data: {
            type: 'INVENTORY',
            issued_by,
            description: JSON.stringify(meta),
        },
    });
};

// Compares an item before/after an update and, if anything changed, writes one
// Normal report describing it. Skips writing when nothing actually changed.
export const reportItemUpdate = async (before, after, issued_by, source) => {
    const changes = [];
    let action = null;

    const qtyBefore = Number(before.qty);
    const qtyAfter = Number(after.qty);
    if (qtyAfter > qtyBefore) {
        action = 'Stock added';
        changes.push(`Stock increased from ${qtyBefore} to ${qtyAfter} (+${qtyAfter - qtyBefore})`);
    } else if (qtyAfter < qtyBefore) {
        action = 'Stock removed';
        changes.push(`Stock decreased from ${qtyBefore} to ${qtyAfter} (${qtyAfter - qtyBefore})`);
    }

    // is_ordered is reused as the "Requires Inspection" flag
    if (before.is_ordered !== after.is_ordered) {
        if (!action) action = after.is_ordered ? 'Marked as Requires Inspection' : 'Removed from Requires Inspection';
        changes.push(after.is_ordered ? 'Flagged as "Requires Inspection"' : 'Cleared "Requires Inspection" flag');
    }

    const fieldChecks = [
        ['SKU', before.sku, after.sku],
        ['Name', before.name, after.name],
        ['Price', String(before.price), String(after.price)],
        ['Description', before.description || '', after.description || ''],
    ];
    for (const [label, b, a] of fieldChecks) {
        if (b !== a) {
            if (!action) action = 'Product updated';
            changes.push(`${label} changed from "${b}" to "${a}"`);
        }
    }

    if (!action) return; // nothing changed — don't create a noise report

    return createReport({ issued_by, action, status: 'NORMAL', source, details: changes.join('; '), item: after });
};

// Returns all inventory reports, newest first, with the JSON description parsed
// back into flat fields plus the user who triggered each one.
export const getAllReports = async () => {
    const reports = await prisma.report.findMany({
        where: { type: 'INVENTORY' },
        orderBy: { created_at: 'desc' },
        include: { issuer: { select: { id: true, name: true, email: true, role: true } } },
    });
    return reports.map(parseReport);
};

const parseReport = (r) => {
    let meta = {};
    try {
        meta = JSON.parse(r.description);
    } catch {
        // Older / plain-text reports: fall back to using the raw text as the action
        meta = { action: r.description };
    }
    return {
        id: r.id,
        type: r.type,
        action: meta.action || '—',
        status: meta.status || 'NORMAL',
        source: meta.source || 'client',
        details: meta.details || '',
        exception_reason: meta.exception_reason || '',
        item_sku: meta.item_sku || '',
        item_name: meta.item_name || '',
        created_at: r.created_at,
        user: r.issuer
            ? { name: r.issuer.name, email: r.issuer.email, role: r.issuer.role }
            : null,
    };
};
