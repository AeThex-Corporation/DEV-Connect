import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clipboard, Check } from 'lucide-react';

const TemplateCard = ({ title, content }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 relative">
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-5 w-5 text-green-400" /> : <Clipboard className="h-5 w-5" />}
      </Button>
      <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-black/30 p-4 rounded-md overflow-x-auto">
        <code>{content}</code>
      </pre>
    </div>
  );
};

const ContractTemplates = () => {
  const simpleCommission = `
**Simple Commission Agreement**

**1. Parties**
- Client: [Client Name]
- Developer: [Developer Name]

**2. Project Description**
- A brief, clear description of the work to be done (e.g., "One 3D model of a sci-fi sword").

**3. Deliverables**
- Final files to be delivered (e.g., ".fbx file and 2K textures").

**4. Payment**
- Total Fee: [Amount, e.g., $100 USD]
- Payment Schedule: [e.g., "50% upfront, 50% upon completion"].

**5. Deadline**
- Estimated Completion Date: [Date]

**6. Revisions**
- Number of included revision rounds: [e.g., "Two rounds of minor revisions"].

**7. Signatures**
- Client: _________________________
- Developer: ______________________
  `;

  const shortTermProject = `
**Short-Term Project Agreement**

**1. Introduction**
This agreement is between [Client Name] ("Client") and [Developer Name] ("Developer") for the project described below, effective [Date].

**2. Scope of Work**
- Project Title: [Project Title]
- Detailed Description: [Provide a detailed breakdown of all tasks, features, and objectives.]

**3. Timeline & Milestones**
- Project Start Date: [Date]
- Milestone 1: [Description & Due Date]
- Milestone 2: [Description & Due Date]
- Final Delivery Date: [Date]

**4. Compensation**
- Total Project Fee: [Amount]
- Payment Schedule:
  - [e.g., 30% on signing]
  - [e.g., 30% on Milestone 1 completion]
  - [e.g., 40% on final delivery]

**5. Revisions & Feedback**
- The fee includes [Number] rounds of revisions per milestone. Additional revisions will be billed at [Hourly Rate].

**6. Confidentiality**
- Both parties agree to keep project details confidential.

**7. Ownership & Rights**
- Upon final payment, the Client will own the rights to the final delivered work. The Developer retains the right to display the work in their portfolio.

**8. Termination**
- Either party may terminate with [Number] days' written notice. If terminated by the Client, the Developer is entitled to payment for work completed.

**9. Signatures**
- Client: _________________________
- Developer: ______________________
  `;

  const retainerAgreement = `
**Monthly Retainer Agreement**

**1. Parties**
This agreement is between [Client Name] ("Client") and [Developer Name] ("Developer"), effective [Start Date].

**2. Services**
The Developer agrees to provide the following services on a retainer basis:
- [e.g., General scripting support]
- [e.g., Bug fixes and maintenance]
- [e.g., Asset integration]

**3. Retainer Fee & Hours**
- Monthly Fee: [Amount, e.g., $1,000 USD]
- Included Hours: [Number] hours per month.
- Overage Rate: Work beyond the included hours will be billed at [Amount] per hour. Unused hours [do/do not] roll over to the next month.

**4. Term**
- This agreement begins on [Start Date] and continues on a month-to-month basis.
- Either party may terminate this agreement with [Number, e.g., 30] days' written notice.

**5. Communication**
- The primary points of contact will be [Client Contact] and [Developer Contact].
- The Developer will provide a weekly summary of hours used and tasks completed.

**6. Payment**
- The monthly retainer fee is due on the [e.g., 1st] of each month for the upcoming month's work.

**7. Signatures**
- Client: _________________________
- Developer: ______________________
  `;

  return (
    <div className="space-y-8 mt-8">
      <TemplateCard title="Simple Commission" content={simpleCommission.trim()} />
      <TemplateCard title="Short-Term Project" content={shortTermProject.trim()} />
      <TemplateCard title="Monthly Retainer" content={retainerAgreement.trim()} />
    </div>
  );
};

export default ContractTemplates;