import { useSecrets } from "#/hooks/useSecrets";
import { isCurrentRole, ROLES } from "#/utils/roles";

import { messages } from "./messages";

// Months are UTC so a role never shifts a month in the visitor's time zone.
const monthFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatMonth(month: string) {
  return monthFormat.format(new Date(month));
}

// The roles, most recent first. A visitor back from the black hole (an easter egg) finds one
// more on top, from the years that passed meanwhile.
export function WorkPanel() {
  const secrets = useSecrets();

  return (
    <ol aria-label={messages.rolesLabel} className="border-l border-rule">
      {secrets.hasCrossedHorizon ? (
        <li className="relative pb-5.5 pl-5.5 before:absolute before:top-2 before:-left-1 before:size-1.75 before:rounded-full before:border before:border-dashed before:border-muted before:bg-background">
          <b className="block font-medium">{messages.future.company}</b>
          <span className="text-label text-muted">{messages.future.title}</span>
        </li>
      ) : null}
      {ROLES.map((role) => {
        const isCurrent = isCurrentRole(role);

        return (
          <li
            key={role.id}
            data-status={isCurrent ? "current" : "past"}
            className="relative pb-5.5 pl-5.5 before:absolute before:top-2 before:-left-1 before:size-1.75 before:rounded-full before:bg-rule data-[status=current]:before:bg-accent data-[status=current]:before:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_25%,transparent)]"
          >
            <b className="block font-medium">{role.company}</b>
            <span className="text-label text-muted">
              {role.title} · {formatMonth(role.start)} –{" "}
              {isCurrent ? messages.now : formatMonth(role.end)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
