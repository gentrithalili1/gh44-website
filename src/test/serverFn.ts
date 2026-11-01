type Validator = (input: unknown) => unknown;
type Handler = (context: { data: unknown }) => unknown;

// Stands in for TanStack Start's server functions, which need the server runtime: calling one
// runs its validator and handler in place, as the server would after the network hop.
export function createServerFn() {
  let validate: Validator = (input) => input;

  const builder = {
    validator(validator: Validator) {
      validate = validator;
      return builder;
    },
    handler(handle: Handler) {
      return async (options?: { data?: unknown }) => handle({ data: validate(options?.data) });
    },
  };

  return builder;
}
