import React from 'react';
import { BrainCircuit, BookCheck, FileSpreadsheet } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Understand requirement',
      description:
        'Analyzing your procurement description to extract key specifications and technical parameters.',
      icon: BrainCircuit,
      accentColor: 'text-slate-800'
    },
    {
      number: '02',
      title: 'Identify relevant standards',
      description:
        'Matching extracted parameters with the comprehensive, up-to-date BIS database.',
      icon: BookCheck,
      accentColor: 'text-blue-900'
    },
    {
      number: '03',
      title: 'Recommend and explain',
      description:
        'Providing specific IS recommendations along with a clear rationale for procurement documentation.',
      icon: FileSpreadsheet,
      accentColor: 'text-emerald-800'
    }
  ];

  return (
    <section className="py-16 bg-[#fcf8f8] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] tracking-tight">
            How it Works
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            Streamlined workflow designed for public procurement officers, bid managers, and technical specification committees.
          </p>
        </div>

        {/* 3 Step Cards Grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              id={`how-it-works-step-${step.number}`}
              className="bg-white rounded-xl p-7 border border-gray-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                {/* Number Badge */}
                <div className="w-12 h-9 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center mb-5 group-hover:bg-slate-100 transition-colors">
                  <span className="text-base font-bold text-gray-800 font-['Noto_Sans',sans-serif]">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#1c1b1b] font-['Noto_Sans',sans-serif] mb-2.5">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Decorative Subtle Tag */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Phase {step.number}</span>
                <step.icon className="w-4 h-4 text-gray-400 group-hover:text-[#031632] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
