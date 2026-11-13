type Validator = (input: unknown) => unknown;
type Handler = (context: { data: unknown }) => unknown;

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
