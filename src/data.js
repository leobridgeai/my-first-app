export const categories = [
  {
    name: 'MARKET READINESS',
    key: 'MR',
    questions: [
      {
        num: 1,
        id: 'MR1',
        question: 'Are your target buyers already using cloud-based or digital tools in their workflows?',
        weight: 3,
        exampleNote: 'e.g., Target vertical uses Salesforce, SAP, or similar SaaS tools',
      },
      {
        num: 2,
        id: 'MR2',
        question: 'Do you have existing clients or active pilots in the target region?',
        weight: 2,
        exampleNote: 'e.g., 3 active pilots in UAE with government entities',
      },
      {
        num: 3,
        id: 'MR3',
        question: 'Do you have an existing team or local partners already on the ground in the target market?',
        weight: 2,
        exampleNote: 'e.g., Local distributor signed in KSA; BD lead based in Dubai',
      },
      {
        num: 4,
        id: 'MR4',
        question: 'Do you have references or case studies from organizations in the target region?',
        weight: 3,
        exampleNote: 'e.g., Case study with Dubai Electricity (DEWA)',
      },
    ],
  },
  {
    name: 'GO-TO-MARKET & COMMERCIAL READINESS',
    key: 'GM',
    questions: [
      {
        num: 5,
        id: 'GM1',
        question: 'Do you have a defined pricing strategy adapted for MENA market (vs. copy-paste of US/EU pricing)?',
        weight: 2,
        exampleNote: 'e.g., Regional pricing tier 15% below US list price',
      },
      {
        num: 6,
        id: 'GM2',
        question: 'Do you have Arabic-speaking pre-sales or customer success capabilities?',
        weight: 3,
        exampleNote: 'e.g., 2 Arabic-speaking CSMs on staff',
      },
      {
        num: 7,
        id: 'GM3',
        question: 'Have you identified and mapped key system integrators and channel partners in target markets?',
        weight: 2,
        exampleNote: 'e.g., Mapped 5 SIs including Deloitte ME, PwC ME',
      },
      {
        num: 8,
        id: 'GM4',
        question: 'Do you have a MENA-specific marketing presence (website localization, regional content, events)?',
        weight: 2,
        exampleNote: 'e.g., Arabic landing page live; attended GITEX 2025',
      },
    ],
  },
  {
    name: 'LOCALIZATION',
    key: 'LM',
    questions: [
      {
        num: 9,
        id: 'LM1',
        question: 'Can your product operate in new geographies without requiring major localization changes?',
        weight: 3,
        exampleNote: 'e.g., Platform is language-agnostic; no locale-specific logic',
      },
      {
        num: 10,
        id: 'LM2',
        question: 'Can your product support multi-language UI and communications (e.g., Arabic RTL, local languages)?',
        weight: 2,
        exampleNote: 'e.g., Full Arabic RTL support shipped in v3.2',
      },
      {
        num: 11,
        id: 'LM3',
        question: 'Is your documentation, help center, and onboarding material adaptable for local markets?',
        weight: 2,
        exampleNote: 'e.g., Help center available in EN/AR; onboarding guides in progress',
      },
    ],
  },
  {
    name: 'GOVERNMENT & ENTERPRISE PROCUREMENT',
    key: 'GP',
    questions: [
      {
        num: 12,
        id: 'GP1',
        question: 'Do you have a relationship strategy for key government/semi-government decision-makers?',
        weight: 3,
        exampleNote: 'e.g., Active relationship with ADDA and Saudi MCIT',
      },
      {
        num: 13,
        id: 'GP2',
        question: 'Can your sales cycle accommodate 6-18 month government procurement timelines?',
        weight: 2,
        exampleNote: 'e.g., Previous 12-month gov sales cycle completed successfully',
      },
    ],
  },
  {
    name: 'DATA RESIDENCY & COMPLIANCE',
    key: 'DR',
    questions: [
      {
        num: 14,
        id: 'DR1',
        question: 'Can your platform host data within GCC countries (UAE, KSA, Bahrain, Qatar)?',
        weight: 3,
        exampleNote: 'e.g., AWS Bahrain region (me-south-1) available',
      },
      {
        num: 15,
        id: 'DR2',
        question: 'Can you provide data residency certificates or attestations upon request?',
        weight: 2,
        exampleNote: 'e.g., SOC 2 Type II report includes data residency controls',
      },
      {
        num: 16,
        id: 'DR3',
        question: 'Do you have a documented data breach notification process?',
        weight: 2,
        exampleNote: 'e.g., 72-hour breach notification SLA documented in DPA',
      },
    ],
  },
  {
    name: 'SECURITY & CERTIFICATIONS',
    key: 'SC',
    questions: [
      {
        num: 17,
        id: 'SC1',
        question: 'Do you hold internationally recognized security certifications (e.g., ISO 27001, SOC 2)?',
        weight: 3,
        exampleNote: 'e.g., ISO 27001 certified (exp. 2026); SOC 2 Type II current',
      },
      {
        num: 18,
        id: 'SC2',
        question: 'Do you have a documented incident response plan in case of a security breach?',
        weight: 2,
        exampleNote: 'e.g., IR plan reviewed quarterly; last tabletop drill Jan 2025',
      },
    ],
  },
];

export const TOTAL_MAX_WEIGHT = 43;

export const getTier = (percentage) => {
  if (percentage >= 69)
    return {
      tier: 1,
      label: 'TIER 1: MARKET READY',
      message: 'Bridge AI can help you accelerate your MENA go-to-market.',
    };
  if (percentage >= 40)
    return {
      tier: 2,
      label: 'TIER 2: CONDITIONALLY READY',
      message: 'Bridge AI can help you close the gaps and get to market with confidence.',
    };
  return {
    tier: 3,
    label: 'TIER 3: NOT READY',
    message: 'Bridge AI can help you build a roadmap for successful MENA entry.',
  };
};

export const getStatusBadge = (percentage) => {
  if (percentage === null) return { label: '\u2014', type: 'none' };
  if (percentage >= 69) return { label: 'Ready', type: 'ready' };
  if (percentage >= 40) return { label: 'Gaps', type: 'gaps' };
  return { label: 'Not Ready', type: 'notReady' };
};
