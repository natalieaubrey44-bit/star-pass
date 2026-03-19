import React from "react";
import { cn } from "../lib/utils";

interface PageSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  background?: string;
}

export const PageSection = ({
  id,
  title,
  subtitle,
  children,
  className,
  background,
}: PageSectionProps) => {
  return (
    <section id={id} className={cn("py-16 md:py-24 px-4 sm:px-6", background, className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
};
