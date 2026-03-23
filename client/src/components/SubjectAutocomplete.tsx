import { useState, useEffect, useRef } from 'react';
import { subjectAPI } from '../services/api';

interface Subject {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (name: string, id?: string) => void;
  error?: string;
}

export default function SubjectAutocomplete({ value, onChange, error }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Subject[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSubjects, setRecentSubjects] = useState<Subject[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch recent subjects on mount
  useEffect(() => {
    subjectAPI.getAll().then((res) => setRecentSubjects(res.data.slice(0, 5)));
  }, []);

  // Update internal query if parent value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    onChange(text, undefined); // Clears ID since it's free text now
    
    if (text.length > 1) {
      try {
        const res = await subjectAPI.search(text);
        setResults(res.data);
        setIsOpen(true);
      } catch (e) {}
    } else {
      setResults([]);
      setIsOpen(text.length > 0);
    }
  };

  const handleSelect = (subject: Subject) => {
    setQuery(subject.name);
    onChange(subject.name, subject.id);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-2">
      <label className="text-sm font-bold tracking-wide text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
        Ders / Konu Seç
      </label>
      
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Örn: Matematik - Türev"
        className={`flex h-14 w-full rounded-2xl border-0 bg-[#E8EFF6] px-6 py-4 text-lg text-clay-foreground shadow-clay-pressed placeholder:text-clay-muted focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-accent/20 transition-all duration-200 ${error ? 'ring-2 ring-red-400' : ''}`}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      {isOpen && (
        <div className="absolute top-[80px] z-50 w-full overflow-hidden rounded-[20px] bg-white/90 p-2 shadow-clay-card backdrop-blur-xl">
           {query.length > 0 && !results.find((r) => r.name.toLowerCase() === query.toLowerCase()) && (
             <div 
               className="mb-1 cursor-pointer rounded-xl bg-clay-canvas px-4 py-3 font-bold text-clay-accent transition-colors hover:bg-clay-accent/10"
               onClick={() => {
                 onChange(query, undefined);
                 setIsOpen(false);
               }}
             >
               + "{query}" olarak yeni oluştur
             </div>
           )}
           
           {results.length > 0 ? (
             results.map((subject) => (
               <div
                 key={subject.id}
                 className="cursor-pointer rounded-xl px-4 py-3 font-medium text-clay-foreground transition-colors hover:bg-clay-accent/5"
                 onClick={() => handleSelect(subject)}
               >
                 {subject.name}
               </div>
             ))
           ) : recentSubjects.length > 0 && query.length === 0 ? (
             <>
               <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-clay-muted">Son Kullanılanlar</div>
               {recentSubjects.map((subject) => (
                 <div
                   key={subject.id}
                   className="cursor-pointer rounded-xl px-4 py-3 font-medium text-clay-foreground transition-colors hover:bg-clay-accent/5"
                   onClick={() => handleSelect(subject)}
                 >
                   {subject.name}
                 </div>
               ))}
             </>
           ) : null}
        </div>
      )}
    </div>
  );
}
