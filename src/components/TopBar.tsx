import { ChevronLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  showHelp?: boolean;
  helpHref?: string;
}

export default function TopBar({ title, onBack, showHelp = true, helpHref = '/help' }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-3">
        <div className="flex min-w-11 items-center">
          {onBack && (
            <button
              type="button"
              onClick={onBack ?? (() => navigate(-1))}
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy-700 hover:bg-navy-100 active:bg-navy-200"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </button>
          )}
        </div>
        <h1 className="flex-1 truncate text-center text-base font-semibold text-navy-900">
          {title}
        </h1>
        <div className="flex min-w-11 items-center justify-end">
          {showHelp && (
            <button
              type="button"
              onClick={() => navigate(helpHref)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy-700 hover:bg-navy-100 active:bg-navy-200"
              aria-label="Get help"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
