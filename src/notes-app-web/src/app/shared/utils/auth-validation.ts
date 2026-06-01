const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string, minLength = 8): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  return null;
}
