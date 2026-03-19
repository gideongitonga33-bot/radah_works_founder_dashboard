import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// One-time migration: converts TeamRole.estimated_compensation and Project.budget_total/budget_allocated
// from annual to monthly values (divide by 12).
// Run once, then delete this function.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const results = { roles: 0, projects: 0 };

    // Migrate TeamRole compensation (annual -> monthly)
    const roles = await base44.asServiceRole.entities.TeamRole.list();
    for (const role of roles) {
      if (role.estimated_compensation && role.estimated_compensation > 0) {
        const monthly = Math.round(role.estimated_compensation / 12);
        await base44.asServiceRole.entities.TeamRole.update(role.id, { estimated_compensation: monthly });
        results.roles++;
      }
    }

    // Migrate Project budgets (annual -> monthly)
    const projects = await base44.asServiceRole.entities.Project.list();
    for (const project of projects) {
      const updates = {};
      if (project.budget_total && project.budget_total > 0) {
        updates.budget_total = Math.round(project.budget_total / 12);
      }
      if (project.budget_allocated && project.budget_allocated > 0) {
        updates.budget_allocated = Math.round(project.budget_allocated / 12);
      }
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.Project.update(project.id, updates);
        results.projects++;
      }
    }

    return Response.json({
      success: true,
      message: `Migration complete. Updated ${results.roles} roles and ${results.projects} projects.`,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});