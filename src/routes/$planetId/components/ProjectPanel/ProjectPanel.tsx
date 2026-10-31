import { ExternalLink } from "../ExternalLink";
import { messages } from "./messages";
import { PROJECT_REPOS, type ProjectId } from "./utils/projectRepos";

interface ProjectPanelProps {
  projectId: ProjectId;
}

export function ProjectPanel({ projectId }: ProjectPanelProps) {
  const repo = PROJECT_REPOS[projectId];

  return (
    <p className="grid gap-1">
      <span className="text-xs tracking-kicker text-faint">{messages.repoLabel}</span>
      <span>
        <ExternalLink href={repo.href}>{repo.path}</ExternalLink>
      </span>
    </p>
  );
}
