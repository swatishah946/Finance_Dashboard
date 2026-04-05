import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty',
    }),
});

const financialRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than zero',
      'any.required': 'Amount is required',
    }),
  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Type must be either "income" or "expense"',
      'any.required': 'Type is required',
    }),
  category: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Category must be at least 2 characters',
      'string.max': 'Category cannot exceed 100 characters',
      'any.required': 'Category is required',
      'string.empty': 'Category cannot be empty',
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  date: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Date must be a valid date',
      'date.max': 'Transaction date cannot be in the future',
    }),
});

const updateFinancialRecordSchema = financialRecordSchema.fork(
  Object.keys(financialRecordSchema.describe().keys),
  (schema) => schema.optional()
);

export { loginSchema, financialRecordSchema, updateFinancialRecordSchema };
