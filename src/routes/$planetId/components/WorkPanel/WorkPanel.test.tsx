import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "#/utils/roles";

import { WorkPanel } from "./WorkPanel";

describe("WorkPanel", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("lists every role, most recent first", () => {
    render(<WorkPanel />);

    const roles = within(screen.getByRole("list", { name: "roles" })).getAllByRole("listitem");
    expect(roles).toHaveLength(ROLES.length);
    expect(roles[0]).toHaveTextContent("JOIN");
  });
});
