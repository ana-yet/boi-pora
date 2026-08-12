"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Suggestion {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  category?: string;
}

interface BookSearchInputProps {
  placeholder?: string;
  inputClassName?: string;
  /** Initial input value (e.g. from the URL on /search). */
  initialValue?: string;
  /** Called on plain submit (Enter with no suggestion selected / button). */
  onValueChange?: (value: string) => void;
}

const DEBOUNCE_MS = 250;

/**
 * Search input with a debounced, keyboard-navigable suggestions dropdown
 * (aria combobox pattern). Selecting a suggestion navigates straight to the
 * book page; submitting falls through to the surrounding <form>.
 */
export function BookSearchInput({
  placeholder = "Search by title, author, or keyword...",
  inputClassName = "",
  initialValue = "",
  onValueChange,
}: BookSearchInputProps) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when the URL-driven query changes (render-time state adjustment).
  const [prevInitial, setPrevInitial] = useState(initialValue);
  if (prevInitial !== initialValue) {
    setPrevInitial(initialValue);
    setValue(initialValue);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function fetchSuggestions(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.get<Suggestion[]>(
          `/api/v1/books/autocomplete?q=${encodeURIComponent(q.trim())}`
        );
        setSuggestions(data);
        setOpen(data.length > 0);
        setActive(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
  }

  function navigateTo(s: Suggestion) {
    setOpen(false);
    router.push(`/${s.category || "fiction"}/${s.slug}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        navigateTo(suggestions[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <input
        type="search"
        name="q"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          active >= 0 ? `${listId}-opt-${active}` : undefined
        }
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onValueChange?.(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden text-left"
        >
          {suggestions.map((s, i) => (
            <li
              key={s._id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                navigateTo(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 text-sm ${
                i === active
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-700 dark:text-neutral-200"
              }`}
            >
              <span className="material-icons text-base text-neutral-400">
                menu_book
              </span>
              <span className="flex-1 min-w-0 truncate font-medium">
                {s.title}
              </span>
              {s.author && (
                <span className="text-xs text-neutral-400 truncate max-w-[40%]">
                  {s.author}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
