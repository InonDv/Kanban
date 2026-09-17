import type { WorkloadItem } from "@/lib/workload";

type WorkloadBarProps = {
  items: WorkloadItem[];
};

export function WorkloadBar({ items }: WorkloadBarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="workload-bar"
      className="mb-4 flex shrink-0 flex-wrap items-center gap-2"
    >
      {items.map((item) => (
        <div
          key={item.employeeId}
          data-testid={`workload-${item.employeeId}`}
          className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] px-3 py-1.5"
        >
          <span className="text-sm font-medium text-[var(--color-navy)]">
            {item.name}
          </span>
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1.5 py-0.5 text-xs font-semibold text-white">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
