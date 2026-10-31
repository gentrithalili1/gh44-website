// Most recent first. Months are ISO `YYYY-MM`; `end: null` is the current role.
export type Role = {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string | null;
};

export const ROLES = [
  { id: "join", company: "JOIN", title: "Senior Frontend Engineer", start: "2026-02", end: null },
  {
    id: "belt-software",
    company: "Belt Software",
    title: "Senior Frontend Engineer",
    start: "2023-08",
    end: "2026-02",
  },
  {
    id: "povio",
    company: "Povio",
    title: "Senior Frontend Engineer",
    start: "2021-08",
    end: "2023-09",
  },
  {
    id: "beetroot-academy",
    company: "Beetroot Academy Kosovo",
    title: "Advanced JavaScript Trainer",
    start: "2020-06",
    end: "2023-08",
  },
  {
    id: "kutia",
    company: "Kutia Digital Agency",
    title: "Frontend Developer & Team Lead",
    start: "2019-03",
    end: "2021-08",
  },
  {
    id: "atis",
    company: "ATIS Digital Agency",
    title: "JavaScript Developer",
    start: "2018-02",
    end: "2019-03",
  },
  { id: "ubt", company: "UBT", title: "JavaScript Developer", start: "2017-03", end: "2018-02" },
  {
    id: "rrota",
    company: "Rrota",
    title: "Web Developer Intern",
    start: "2016-10",
    end: "2017-01",
  },
] as const satisfies readonly Role[];

export function isCurrentRole(role: Role): role is Role & { end: null } {
  return role.end === null;
}
