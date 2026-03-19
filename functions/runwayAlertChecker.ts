import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Works for both scheduled (service role) and manual calls (user auth)
    let callerEmail = null;
    try {
      const user = await base44.auth.me();
      callerEmail = user?.email;
    } catch (_) { /* scheduled call — no user */ }

    const projects = await base44.asServiceRole.entities.Project.filter({ status: 'active' });
    const users = await base44.asServiceRole.entities.User.list();

    const alerts = [];

    for (const project of projects) {
      const monthlyBudget = project.budget_total || 0;
      if (!monthlyBudget) continue;

      // Get financial entries to compute avg burn rate
      const entries = await base44.asServiceRole.entities.FinancialEntry.filter({ project_id: project.id });

      const months = [...new Set(entries.map(e => e.month))].sort();
      if (months.length === 0) continue;

      const monthlyBurns = months.map(month => {
        const monthEntries = entries.filter(e => e.month === month);
        const costs = monthEntries.filter(e => e.type === 'cost').reduce((s, e) => s + e.amount, 0);
        const revenue = monthEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0);
        return Math.max(0, costs - revenue);
      });

      const avgBurnRate = Math.round(monthlyBurns.reduce((a, b) => a + b, 0) / monthlyBurns.length);
      if (avgBurnRate <= 0) continue;

      const runway = Math.floor(monthlyBudget / avgBurnRate);

      if (runway <= 3) {
        // Find the owner of this project
        const owner = users.find(u => u.email === project.created_by);
        const recipientEmail = owner?.email || callerEmail;
        if (!recipientEmail) continue;

        const subject = runway <= 1
          ? `🚨 CRITICAL: ${project.name} has less than 1 month of runway!`
          : `⚠️ Low Runway Alert: ${project.name} has only ${runway} month${runway === 1 ? '' : 's'} left`;

        const body = `
Hi ${owner?.full_name || 'Founder'},

This is an automated runway alert from Radah Works.

📊 Project: ${project.name}
💰 Monthly Budget: $${monthlyBudget.toLocaleString()}
🔥 Avg Monthly Burn Rate: $${avgBurnRate.toLocaleString()}
⏱️ Estimated Runway: ${runway} month${runway === 1 ? '' : 's'}

${runway <= 1
  ? '🚨 CRITICAL: Your project is at immediate risk of running out of funds. Take action NOW.'
  : '⚠️ Warning: Your runway is critically low. Consider reducing costs or beginning a fundraising round immediately.'}

Recommended actions:
• Review and cut non-essential expenses
• Accelerate revenue-generating activities
• Begin fundraising conversations immediately
• Explore bridge financing options

Log in to Radah Works to view your detailed Budget & Runway forecast.

— Radah Works Alert System
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject,
          body,
        });

        alerts.push({ project: project.name, runway, email: recipientEmail });
      }
    }

    return Response.json({
      success: true,
      checked: projects.length,
      alerts_sent: alerts.length,
      alerts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});