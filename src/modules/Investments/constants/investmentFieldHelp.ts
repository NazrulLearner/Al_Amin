// ==========================================
// Plain-language labels, placeholders and help text for the Investment forms.
// Kept in ONE file so that Bangla can be added later by changing text here only.
// These are explanations of words — they do not change any rule or stored value.
// ==========================================

export interface FieldHelp {
  label: string;
  placeholder?: string;
  tip?: string; // shown in the (i) tooltip
  hint?: string; // shown under the field
}

export const FIELD_HELP: Record<string, FieldHelp> = {
  investment_name: { label: 'Investment Name', placeholder: 'e.g. Dutch-Bangla Bank FDR 2026', hint: 'A short name everyone will recognise in the list.' },
  reference_number: { label: 'Reference Number', placeholder: 'e.g. INV-001 or FDR certificate no.', hint: 'Must be unique. Use the number on the paper/certificate so records can be matched later.' },
  category: { label: 'Category', placeholder: 'Select category...', hint: 'The type of investment. Used for reports.' },
  start_date: { label: 'Start Date', hint: 'When the investment begins.' },
  maturity_date: { label: 'Maturity Date', hint: 'When it ends or is paid back. Optional — some investments have no fixed end date.' },
  location: { label: 'Location', placeholder: 'e.g. Dhaka branch' },
  purpose: { label: 'Purpose', placeholder: 'e.g. Land purchase' },
  description: { label: 'Description', placeholder: 'Anything else worth remembering about this investment' },

  investment_structure: { label: 'Who Is Investing?', tip: 'Choose the option that best describes how many parties invest and who leads.' },
  somity_role: { label: "Somity's Role", tip: "What the Somity is in this investment (for example, the only investor, or one of several)." },
  lead_investor_name: { label: 'Lead Investor', placeholder: 'e.g. Rahim Enterprise', tip: 'The outside person or organisation that leads this investment.' },
  total_required_investment: { label: 'Total Required Investment (৳)', placeholder: 'e.g. 150000', tip: 'The WHOLE amount this investment needs, from all investors together — not only the Somity share.' },

  return_model: { label: 'Return Model', tip: 'How the money is expected to come back (a fixed amount, a share of profit, etc.).' },
  return_rate: { label: 'Return Rate (%)', placeholder: 'e.g. 10', hint: 'Between 0 and 100. Leave empty if there is no fixed rate.' },
  return_duration: { label: 'Return Duration', placeholder: 'e.g. 12 months', hint: 'How long until the return is expected.' },
  expected_return_amount: { label: 'Expected Return (৳)', placeholder: 'e.g. 15000', tip: 'The total return you expect, typed by you. The system does not calculate it.' },

  risk_level: { label: 'Risk Level', tip: 'How likely it is that money is delayed or lost.' },
  risk_description: { label: 'Risk Description', placeholder: 'What could go wrong?' },
  mitigation_plan: { label: 'Risk Mitigation', placeholder: 'What will be done to reduce the risk?', tip: 'Steps planned to reduce or handle the risk.' },
  collateral_security: { label: 'Collateral / Security', placeholder: 'e.g. Land papers, bank guarantee', tip: 'Anything held as a guarantee in case the money is not returned.' },

  // Participants
  p_name: { label: 'Name', placeholder: 'Investor name' },
  p_participant_type: { label: 'Participant Type', tip: 'Is this the Somity, a person, or an organisation?' },
  p_role: { label: 'Role', tip: "This person's position in the investment." },
  p_contact: { label: 'Contact', placeholder: 'Phone / email' },
  p_committed_amount: { label: 'Committed Amount (৳)', placeholder: 'e.g. 50000', tip: 'The amount this person has PROMISED to invest. Money actually paid is recorded later in the Funding tab.' },
  p_participation_pct: { label: 'Participation %', hint: 'Calculated automatically: Committed ÷ Total Required Investment.' },
  p_return_share_pct: { label: 'Return Share %', placeholder: 'e.g. 40', tip: 'The share of the return this person will receive. You enter it — it is not calculated.' },
  p_status: { label: 'Status' },
  p_return_terms: { label: 'Return Terms', placeholder: 'e.g. 12% p.a. quarterly' },
  p_agreement: { label: 'Agreement Reference', placeholder: 'Agreement ref / date' },
};

// One-line meaning of each dropdown choice (stored values stay unchanged).
export const STRUCTURE_HELP: Record<string, string> = {
  'Somity Only': 'Only the Somity puts in money.',
  'Somity as Lead Investor': 'The Somity leads; others may join it.',
  'Somity as Co-Investor': 'Someone else leads; the Somity joins with its own share.',
  'External Lead Investor + Somity': 'An outside person or organisation leads; the Somity is one of the investors.',
  'Multiple Co-Investors': 'Several investors share it.',
  'Joint Investment': 'Two or more parties invest together.',
  Other: 'None of the above.',
};

export const ROLE_HELP: Record<string, string> = {
  'Lead Investor': 'Leads or manages the investment.',
  'Co-Investor': 'Invests alongside the lead.',
  'Sole Investor': 'The only investor.',
  Participant: 'Takes part without leading.',
};

export const RETURN_MODEL_HELP: Record<string, string> = {
  'Fixed Return': 'A fixed amount or rate agreed in advance (like FDR interest).',
  'Percentage Return': 'A percentage of the invested amount.',
  'Profit Sharing': 'Investors share the actual profit.',
  'Revenue Sharing': 'Investors share the income of the business.',
  'Equity/Ownership': 'Return comes from owning a share of the business.',
  'Custom Agreement': 'Special terms written in an agreement.',
};

export const RISK_HELP: Record<string, string> = {
  Low: 'Little chance of loss.',
  Medium: 'Some chance of loss or delay.',
  High: 'A real chance of loss.',
  Critical: 'Serious danger of losing a large part of the money.',
};

// The Lead Investor box is only needed when an outside party leads.
export const STRUCTURES_WITH_EXTERNAL_LEAD = ['External Lead Investor + Somity', 'Other'];
