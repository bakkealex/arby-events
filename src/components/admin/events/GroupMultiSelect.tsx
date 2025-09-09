import { useState, useRef, useEffect } from "react";

type Group = { id: string; name: string };

interface Props {
  groups: Group[];
  selectedGroups: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
}

export default function GroupMultiSelect({
  groups,
  selectedGroups,
  onChange,
  placeholder = "Search groups...",
  maxHeight = "max-h-48",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const filtered = query
    ? groups.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = (id: string) => {
    if (selectedGroups.includes(id)) {
      onChange(selectedGroups.filter(s => s !== id));
    } else {
      onChange([...selectedGroups, id]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(v => !v);
          }
        }}
        className="w-full text-left px-3 h-10 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-2">
          {selectedGroups.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</span>
          ) : (
            selectedGroups.map(id => {
              const g = groups.find(x => x.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
                >
                  <span>{g?.name ?? id}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(id);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    aria-label={`Remove ${g?.name ?? "group"}`}
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>

      {open && (
        <div className={`absolute z-20 mt-2 w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg ${maxHeight}`}>
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter groups..."
              className="w-full px-3 h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">No groups found</div>
            ) : (
              filtered.map(group => {
                const selected = selectedGroups.includes(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggle(group.id)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${selected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <span className="text-sm text-gray-800 dark:text-white">{group.name}</span>
                    {selected ? (
                      <span className="text-sm text-blue-600 dark:text-blue-300">Selected</span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Select</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setQuery("");
                setOpen(false);
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-blue-600 dark:text-blue-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}