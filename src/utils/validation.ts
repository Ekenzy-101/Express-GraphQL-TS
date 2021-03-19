import FastestValidator, { ValidationSchema } from "fastest-validator";

const validator = new FastestValidator();

export const getValidationErrors = (
  value: any,
  schema: ValidationSchema<any>
) => {
  const formattedErrors: Record<string, string> = {};

  const validationErrors = validator.validate(value, schema);

  if (validationErrors === true) return null;

  validationErrors.forEach((error) => {
    const key = error.field;
    formattedErrors[key] = error.message!;
  });

  return formattedErrors;
};
