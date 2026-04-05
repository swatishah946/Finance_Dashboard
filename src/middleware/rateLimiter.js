import rateLimit from 'express-rate-limit';

// General API rate limiter (protects against general spam)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 15 mins limit!',
  },
});

// Strict authenticator rate limiter (protects against brute-force password guessing)
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Login Attempts',
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});
