import React from 'react';
import { 
  FileSearch, 
  BookCheck, 
  HelpCircle, 
  ShieldCheck, 
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Understand Procurement Items',
      description:
        'Disaggregates tender requirements into distinct commodities, isolated quantities, and detected technical parameters.',
      icon: FileSearch,
      accent: 'border-slate-300 text-slate-800'
    },
    {
      number: '02',
      title: 'Identify Applicable Standards',
      description:
        'Maps electrical, mechanical, and safety specifications against the indexed 1,392 Indian Standards catalogue.',
      icon: BookCheck,
      accent: 'border-blue-300 text-blue-900'
    },
    {
      number: '03',
      title: 'Ask for Missing Information',
      description:
        'Triggers targeted technical clarification questions when critical ratings, voltage grades, or dimensions are omitted.',
      icon: HelpCircle,
      accent: 'border-amber-300 text-amber-800'
    },
    {
      number: '04',
      title: 'Verify Against Evidence',
      description:
        'Strictly gates claims: SOURCE_SUPPORTED vs NOT_AVAILABLE. Verifies tender citations and blocks uncatalogued numbers.',
      icon: ShieldCheck,
      accent: 'border-emerald-300 text-emerald-800'
    },
    {
      number: '05',
      title: 'Auditable Recommendation',
      description:
        'Delivers Primary and Supporting standard classifications with mandatory clauses, model BoQ text, and print-ready dossiers.',
      icon: FileSpreadsheet,
      accent: 'border-indigo-300 text-indigo-900'
    }
  ];

  return (
    <section className="py-14 bg-[#fcf8f8] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold mb-3">
            <span>Procurement Standards Advisory Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] tracking-tight">
            How It Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From raw tender schedules to audit-defensible BoQ specifications in 5 structured stages under GFR 2017 Rule 144(xi).
          </p>
        </div>

        {/* 5 Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              id={`how-it-works-step-${step.number}`}
              className="bg-white rounded-lg p-5 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 relative"
            >
              <div>
                {/* Number Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-7 rounded bg-slate-50 border border-gray-200 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-gray-800 font-mono">
                      {step.number}
                    </span>
                  </div>
                  <step.icon className="w-4 h-4 text-slate-400 group-hover:text-[#081a33] transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] mb-2 leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step indicator footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Stage {index + 1}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 hidden lg:block" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

