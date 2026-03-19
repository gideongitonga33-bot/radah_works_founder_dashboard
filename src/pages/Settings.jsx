import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Save, Loader2, UserPlus, User, Building2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [founderForm, setFounderForm] = useState({});
  const [companyForm, setCompanyForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFounderForm({
        bio: user.bio || '',
        linkedin: user.linkedin || '',
        phone: user.phone || '',
        location: user.location || '',
      });
      setCompanyForm({
        company_name: user.company_name || '',
        industry: user.industry || '',
        website: user.website || '',
        company_stage: user.company_stage || '',
        company_description: user.company_description || '',
      });
    }
  }, [user?.email]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ ...founderForm, ...companyForm });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    setInviteMsg(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
    setTimeout(() => setInviteMsg(''), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your founder profile and company details</p>
      </div>

      {/* Founder Profile */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-semibold flex items-center gap-2">
          <User size={16} /> Founder Profile
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-muted/30"
              value={user?.full_name || ''}
              disabled
              title="Name is managed by your account"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-muted/30"
              value={user?.email || ''}
              disabled
              title="Email is managed by your account"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Bio</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="Tell us about yourself as a founder..."
            value={founderForm.bio || ''}
            onChange={e => setFounderForm(p => ({ ...p, bio: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">LinkedIn URL</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="https://linkedin.com/in/..."
              value={founderForm.linkedin || ''}
              onChange={e => setFounderForm(p => ({ ...p, linkedin: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="+1 234 567 8900"
              value={founderForm.phone || ''}
              onChange={e => setFounderForm(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Location</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="City, Country"
            value={founderForm.location || ''}
            onChange={e => setFounderForm(p => ({ ...p, location: e.target.value }))}
          />
        </div>
      </div>

      {/* Company Details */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-semibold flex items-center gap-2">
          <Building2 size={16} /> Company Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Name</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Acme Inc."
              value={companyForm.company_name || ''}
              onChange={e => setCompanyForm(p => ({ ...p, company_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Industry</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="e.g. FinTech, HealthTech"
              value={companyForm.industry || ''}
              onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Website</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="https://yourcompany.com"
              value={companyForm.website || ''}
              onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Stage</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={companyForm.company_stage || ''}
              onChange={e => setCompanyForm(p => ({ ...p, company_stage: e.target.value }))}
            >
              <option value="">Select stage...</option>
              <option value="Pre-idea">Pre-idea</option>
              <option value="Idea">Idea</option>
              <option value="Prototype">Prototype</option>
              <option value="MVP">MVP</option>
              <option value="Early Traction">Early Traction</option>
              <option value="Growth">Growth</option>
              <option value="Scale">Scale</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Company Description</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="What does your company do?"
            value={companyForm.company_description || ''}
            onChange={e => setCompanyForm(p => ({ ...p, company_description: e.target.value }))}
          />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saved ? '✓ Saved!' : 'Save Profile'}
      </button>

      {/* Invite Collaborator */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-3">
        <h3 className="font-serif text-base font-semibold flex items-center gap-2"><UserPlus size={16} /> Invite Collaborator</h3>
        <p className="text-sm text-muted-foreground">Invite a co-founder or team member to access this workspace.</p>
        <div className="flex gap-2">
          <input
            type="email"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="colleague@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button onClick={handleInvite} disabled={inviting || !inviteEmail}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40">
            {inviting ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />} Invite
          </button>
        </div>
        {inviteMsg && <p className="text-sm text-green-600 font-medium">{inviteMsg}</p>}
      </div>
    </div>
  );
}