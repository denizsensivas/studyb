import { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-clay-canvas overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div
          className="absolute h-[60vh] w-[60vh] rounded-full bg-[#2563EB]/10 blur-3xl -top-[10%] -left-[10%] animate-clay-float"
        />
        <div
          className="absolute h-[50vh] w-[50vh] rounded-full bg-[#0EA5E9]/10 blur-3xl -right-[10%] top-[20%] animate-clay-float-delayed animation-delay-2000"
        />
        <div
          className="absolute h-[45vh] w-[45vh] rounded-full bg-[#60A5FA]/10 blur-3xl left-[30%] -bottom-[5%] animate-clay-float-slow animation-delay-4000"
        />
        <div
          className="absolute h-[35vh] w-[35vh] rounded-full bg-[#10B981]/8 blur-3xl right-[20%] bottom-[30%] animate-clay-float animation-delay-2000"
        />
      </div>

      {/* Page content */}
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}
