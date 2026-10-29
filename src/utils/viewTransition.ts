type ViewTransitionOptions = {
  types: (locationChange: { pathChanged: boolean }) => string[] | false;
};

export const VIEW_TRANSITION_TYPES = {
  page: "page",
  menu: "menu",
} as const;

type ViewTransitionType = (typeof VIEW_TRANSITION_TYPES)[keyof typeof VIEW_TRANSITION_TYPES];

type ResolveViewTransitionTypesParams = {
  type: ViewTransitionType;
  pathChanged: boolean;
};

export function resolveViewTransitionTypes({
  type,
  pathChanged,
}: ResolveViewTransitionTypesParams) {
  return pathChanged ? [type] : false;
}

export function getViewTransition(type: ViewTransitionType): ViewTransitionOptions {
  return { types: ({ pathChanged }) => resolveViewTransitionTypes({ type, pathChanged }) };
}
