// Single source of truth for all recipients
const ALL_RECIPIENTS = [
  // Personal/Family
  { value: 'mother', label: 'Mother', categories: ['personal', 'family'], hasGeneratorPage: true },
  { value: 'father', label: 'Father', categories: ['personal', 'family'], hasGeneratorPage: true },
  { value: 'son', label: 'Son', categories: ['personal', 'family'], hasGeneratorPage: true },
  { value: 'daughter', label: 'Daughter', categories: ['personal', 'family'], hasGeneratorPage: true },
  { value: 'wife', label: 'Wife', categories: ['personal'], hasGeneratorPage: true },
  { value: 'husband', label: 'Husband', categories: ['personal'], hasGeneratorPage: true },
  { value: 'friend', label: 'Friend', categories: ['personal'], hasGeneratorPage: true },
  { value: 'romantic', label: 'Romantic Partner', categories: ['personal'], hasGeneratorPage: true },
  { value: 'girlfriend', label: 'Girlfriend', categories: ['personal'], hasGeneratorPage: true },
  { value: 'boyfriend', label: 'Boyfriend', categories: ['personal'], hasGeneratorPage: true },
  { value: 'sibling', label: 'Sibling', categories: ['personal', 'family'], hasGeneratorPage: false },
  { value: 'grandmother', label: 'Grandmother', categories: ['personal', 'family'], hasGeneratorPage: false },
  { value: 'grandfather', label: 'Grandfather', categories: ['personal', 'family'], hasGeneratorPage: false },
  { value: 'ex', label: 'Ex-Partner', categories: ['personal'], hasGeneratorPage: false },
  { value: 'neighbor', label: 'Neighbor', categories: ['personal'], hasGeneratorPage: false },

  // Professional
  { value: 'boss', label: 'Boss', categories: ['professional'], hasGeneratorPage: true },
  { value: 'manager', label: 'Manager', categories: ['professional'], hasGeneratorPage: false },
  { value: 'supervisor', label: 'Supervisor', categories: ['professional'], hasGeneratorPage: false },
  { value: 'colleague', label: 'Colleague', categories: ['professional'], hasGeneratorPage: true },
  { value: 'client', label: 'Client', categories: ['professional'], hasGeneratorPage: true },
  { value: 'teacher', label: 'Teacher', categories: ['professional'], hasGeneratorPage: true },
  { value: 'partner', label: 'Business Partner', categories: ['professional'], hasGeneratorPage: false },
  { value: 'hr', label: 'HR', categories: ['professional'], hasGeneratorPage: false },
  { value: 'vendor', label: 'Vendor/Supplier', categories: ['professional'], hasGeneratorPage: false },
  { value: 'investor', label: 'Investor', categories: ['professional'], hasGeneratorPage: false },
  { value: 'employee', label: 'Employee', categories: ['professional'], hasGeneratorPage: false },
  { value: 'professor', label: 'Professor', categories: ['professional'], hasGeneratorPage: false },
  { value: 'classmate', label: 'Classmate', categories: ['professional'], hasGeneratorPage: false },
  { value: 'mentor', label: 'Mentor', categories: ['professional'], hasGeneratorPage: false },
];

// For /examples and content collections (12 recipients with generator pages)
export const recipients = ALL_RECIPIENTS
  .filter(r => r.hasGeneratorPage)
  .map(r => ({
    value: r.value,
    label: r.labelAlt || r.label
  }));

// For ApologyWizard - Personal
export const personalRecipients = ALL_RECIPIENTS
  .filter(r => r.categories.includes('personal'))
  .map(r => ({
    value: r.value,
    label: r.label
  }));

// For ApologyWizard - Professional
export const professionalRecipients = ALL_RECIPIENTS
  .filter(r => r.categories.includes('professional'))
  .map(r => ({
    value: r.value,
    label: r.label
  }));

// For Footer - Family (4 recipients)
export const familyRecipients = ALL_RECIPIENTS
  .filter(r => r.categories.includes('family'))
  .map(r => ({
    value: r.value,
    label: r.label
  }));


export const contextsByRecipient = {
  mother: [
    { label: "Forgot Mother's Day", text: "I forgot to call on Mother's Day" },
    { label: "Missed family dinner", text: "I missed our weekly family dinner" },
    { label: "Said something hurtful", text: "I said something hurtful during an argument" },
    { label: "Neglected chores", text: "I neglected to help with household chores" },
    { label: "Forgot to thank you", text: "I forgot to thank you for your support" },
    { label: "Missed family event", text: "I missed an important family event" },
    { label: "Was disrespectful", text: "I was disrespectful in front of others" },
    { label: "Failed to appreciate", text: "I failed to appreciate your sacrifices" },
    { label: "Broke a promise", text: "I broke a promise to spend time together" },
    { label: "Ignored your advice", text: "I ignored your advice and made a mistake" },
  ],
  father: [
    { label: "Forgot Father's Day", text: "I forgot Father's Day" },
    { label: "Broke home project promise", text: "I broke a promise to help with a home project" },
    { label: "Disrespected your advice", text: "I disrespected your advice" },
    { label: "Missed family gathering", text: "I missed an important family gathering" },
    { label: "Failed to appreciate", text: "I failed to show appreciation for your hard work" },
    { label: "Irresponsible with money", text: "I was irresponsible with money you lent me" },
    { label: "Spoke rudely", text: "I spoke rudely to you in front of others" },
    { label: "Excluded from decision", text: "I neglected to include you in an important decision" },
    { label: "Didn't follow through", text: "I failed to follow through on a commitment I made to you" },
    { label: "Didn't support you", text: "I didn't support you during a difficult time" },
  ],
  son: [
    { label: "Missed school event", text: "I missed your important school event" },
    { label: "Harsh criticism", text: "I was too harsh in my criticism" },
    { label: "Broke promise", text: "I broke a promise to spend time together" },
    { label: "Unfair comparison", text: "I compared you unfairly to others" },
    { label: "Didn't listen", text: "I failed to listen when you needed to talk" },
    { label: "Invaded privacy", text: "I invaded your privacy" },
    { label: "Didn't support you", text: "I didn't support your interests or hobbies" },
    { label: "Unrealistic expect.", text: "I set unrealistic expectations" },
    { label: "Didn't acknowledge", text: "I failed to acknowledge your achievements" },
    { label: "Lost temper", text: "I lost my temper and said hurtful things" },
  ],
  daughter: [
    { label: "Forgot recital", text: "I forgot your dance recital" },
    { label: "Dismissed feelings", text: "I was dismissive of your feelings" },
    { label: "Unfair comparison", text: "I compared you unfairly to others" },
    { label: "Career unsupportive", text: "I failed to support your career choices" },
    { label: "Too controlling", text: "I was too controlling of your personal life" },
    { label: "No boundaries", text: "I didn't respect your boundaries" },
    { label: "Missed milestone", text: "I missed an important milestone in your life" },
    { label: "No support", text: "I failed to provide emotional support when you needed it" },
    { label: "Judged relationship", text: "I was judgmental about your relationships" },
    { label: "Didn't trust you", text: "I didn't trust your decision-making abilities" },
  ],
  wife: [
    { label: "Forgot anniversary", text: "I forgot our anniversary" },
    { label: "Neglected chores", text: "I neglected my share of household responsibilities" },
    { label: "Insensitive", text: "I was insensitive to your needs" },
    { label: "Didn't consult", text: "I made an important decision without consulting you" },
    { label: "Career unsupport", text: "I failed to support your career aspirations" },
    { label: "Emotionally distant", text: "I was emotionally distant during a difficult time" },
    { label: "Kept secrets", text: "I broke your trust by keeping secrets" },
    { label: "Prioritized work", text: "I prioritized work over our relationship" },
    { label: "Disrespected family", text: "I was disrespectful to your family members" },
    { label: "No appreciation", text: "I failed to show appreciation for your efforts" },
  ],
  husband: [
    { label: "Didn't consult", text: "I made an important decision without consulting you" },
    { label: "Unsupportive", text: "I was unsupportive during a difficult time" },
    { label: "Took for granted", text: "I took you for granted" },
    { label: "Poor communication", text: "I failed to communicate my feelings effectively" },
    { label: "Neglected us", text: "I neglected our relationship in favor of work or hobbies" },
    { label: "Insensitive", text: "I was insensitive to your emotional needs" },
    { label: "Broke promise", text: "I broke a promise about our financial decisions" },
    { label: "Disrespected family", text: "I was disrespectful to your friends or family" },
    { label: "Didn't acknowledge", text: "I failed to acknowledge your contributions to our home" },
    { label: "Inconsiderate", text: "I was inconsiderate of your personal space and time" },
  ],
  friend: [
    { label: "Forgot birthday", text: "I forgot your birthday" },
    { label: "Shared secret", text: "I shared a secret you told me in confidence" },
    { label: "Bailed last minute", text: "I bailed on our plans at the last minute" },
    { label: "Unsupportive", text: "I was unsupportive during your time of need" },
    { label: "Insensitive joke", text: "I made an insensitive joke at your expense" },
    { label: "Didn't repay", text: "I failed to repay money I borrowed from you" },
    { label: "Took credit", text: "I took credit for your idea" },
    { label: "Judgmental", text: "I was judgmental about your life choices" },
    { label: "Neglected you", text: "I neglected our friendship when I started a new relationship" },
    { label: "Didn't defend you", text: "I failed to stand up for you when others spoke badly about you" },
  ],
  colleague: [
    { label: "Took credit", text: "I took credit for your work" },
    { label: "Missed deadline", text: "I missed an important deadline affecting our team" },
    { label: "Spoke negatively", text: "I spoke negatively about you to other coworkers" },
    { label: "Poor communication", text: "I failed to communicate important information" },
    { label: "Uncooperative", text: "I was uncooperative on a group project" },
    { label: "Inappropriate comment", text: "I made an inappropriate comment in a meeting" },
    { label: "No boundaries", text: "I disrespected your professional boundaries" },
    { label: "Didn't support idea", text: "I failed to support your idea in front of management" },
    { label: "Late to meetings", text: "I was consistently late to our meetings" },
    { label: "Mishandled client", text: "I mishandled a client interaction that affected your work" },
  ],
  romantic: [
    { label: "Stood you up", text: "I stood you up on a date" },
    { label: "Caught lying", text: "I was caught lying about something important" },
    { label: "Flirted with other", text: "I flirted with someone else" },
    { label: "Forgot milestone", text: "I forgot an important milestone in our relationship" },
    { label: "Unavailable", text: "I was emotionally unavailable when you needed support" },
    { label: "Broke promise", text: "I broke a promise about our future plans" },
    { label: "Disrespected family", text: "I was disrespectful to your friends or family" },
    { label: "Invaded privacy", text: "I invaded your privacy by checking your phone" },
    { label: "Poor communication", text: "I failed to communicate my feelings, causing misunderstandings" },
    { label: "Insensitive", text: "I was insensitive about your insecurities" },
  ],
  boss: [
    { label: "Costly mistake", text: "I made a costly mistake at work" },
    { label: "Disrespectful", text: "I was disrespectful during a meeting" },
    { label: "Incomplete task", text: "I failed to complete an important task" },
    { label: "Mishandled client", text: "I mishandled a client relationship" },
    { label: "Late to work", text: "I was consistently late to work" },
    { label: "Missed deadlines", text: "I failed to meet project deadlines" },
    { label: "Dishonest", text: "I was dishonest about my progress on a project" },
    { label: "Undermined you", text: "I undermined your authority in front of the team" },
    { label: "Ignored policies", text: "I neglected to follow company policies" },
    { label: "Poor communication", text: "I failed to communicate important information" },
  ],
  client: [
    { label: "Missed appointment", text: "I missed our scheduled appointment" },
    { label: "Late delivery", text: "I failed to deliver the project on time" },
    { label: "Order error", text: "I made a significant error in your order" },
    { label: "Unprofessional", text: "I was unprofessional in our communication" },
    { label: "Wrong pricing", text: "I misquoted the price for our services" },
    { label: "Slow response", text: "I failed to address your concerns promptly" },
    { label: "Breach confidence", text: "I breached our confidentiality agreement" },
    { label: "No updates", text: "I neglected to inform you about important changes" },
    { label: "Wrong info", text: "I provided incorrect information about our product" },
    { label: "Poor quality", text: "I failed to meet the agreed-upon quality standards" },
  ],
  teacher: [
    { label: "Cheated on test", text: "I cheated on a test" },
    { label: "Disruptive", text: "I was disruptive in class" },
    { label: "Late assignment", text: "I failed to turn in an important assignment" },
    { label: "Plagiarized", text: "I plagiarized on a paper" },
    { label: "Disrespectful", text: "I was disrespectful to you in front of the class" },
    { label: "Lied about absence", text: "I lied about why I missed class" },
    { label: "No group work", text: "I failed to participate in group projects" },
    { label: "Ignored safety", text: "I neglected to follow safety rules in the lab" },
    { label: "Damaged property", text: "I damaged school property" },
    { label: "Bullied student", text: "I bullied another student in your class" },
  ],
  manager: [
    "I missed an important deadline",
    "I made a costly mistake on the project",
    "I was unprofessional in a team meeting",
    "I failed to communicate critical information",
    "I undermined your decision in front of the team",
    "I was consistently late to work",
    "I didn't follow the established protocol",
    "I was dishonest about my progress",
    "I mishandled a client interaction",
    "I failed to support a team member when needed",
  ],
  supervisor: [
    "I didn't complete the assigned tasks on time",
    "I was disrespectful during our one-on-one",
    "I made an error that affected the team's performance",
    "I failed to follow your instructions",
    "I was unprofessional with a colleague",
    "I didn't communicate important updates",
    "I ignored your feedback and made the same mistake",
    "I was late to our scheduled meetings",
    "I complained about you to other team members",
    "I failed to take responsibility for my actions",
  ],
  partner: [
    "I made a business decision without consulting you",
    "I failed to fulfill my partnership obligations",
    "I shared confidential business information",
    "I was unprofessional with a client",
    "I didn't contribute equally to our business",
    "I made a financial decision that affected us both",
    "I was dishonest about business matters",
    "I failed to communicate important developments",
    "I undermined your authority with employees",
    "I put my personal interests above our partnership",
  ],
  hr: [
    "I violated company policy",
    "I was dishonest during the investigation",
    "I failed to report a workplace incident",
    "I was unprofessional with a colleague",
    "I didn't complete required training on time",
    "I misused company resources",
    "I was disrespectful during the HR meeting",
    "I failed to follow the disciplinary process",
    "I shared confidential employee information",
    "I created a hostile work environment",
  ],
  vendor: [
    "I missed the payment deadline",
    "I failed to communicate order changes",
    "I was unprofessional in our communication",
    "I didn't honor our agreement terms",
    "I made unreasonable demands",
    "I was late with the purchase order",
    "I provided incorrect specifications",
    "I damaged your property or equipment",
    "I failed to notify you of delivery issues",
    "I disputed valid charges incorrectly",
  ],
  investor: [
    "I failed to meet the projected milestones",
    "I was dishonest about business performance",
    "I made a major decision without consulting you",
    "I misused the investment funds",
    "I failed to provide regular updates",
    "I didn't disclose important risks",
    "I was unprofessional during the board meeting",
    "I failed to honor our agreement terms",
    "I damaged the company's reputation",
    "I didn't meet my fiduciary responsibilities",
  ],
};

// Tones (9 official tones)
export const tones = [
  { value: 'formal', label: 'Formal', emoji: '🎩', description: 'Respectful and structured.' },
  { value: 'casual', label: 'Casual', emoji: '😊', description: 'Relaxed and friendly.' },
  { value: 'heartfelt', label: 'Heartfelt', emoji: '❤️', description: 'Genuine and emotional.' },
  { value: 'professional', label: 'Professional', emoji: '💼', description: 'Polished and tactful.' },
  { value: 'remorseful', label: 'Remorseful', emoji: '😔', description: 'Deeply regretful.' },
  { value: 'humorous', label: 'Humorous', emoji: '😄', description: 'Light and witty.' },
  { value: 'emotional', label: 'Emotional', emoji: '🥺', description: 'Emotional and heartfelt.' },
  { value: 'apologetic', label: 'Apologetic', emoji: '🙏', description: 'Apologetic and sincere.' },
  { value: 'sincere', label: 'Sincere', emoji: '💛', description: 'Honest and genuine.' }
];
