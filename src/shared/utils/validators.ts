export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value ?? "");
  },
  password: (value: string, minLength = 8): boolean => {
    return (value?.length ?? 0) >= minLength;
  },
  required: (value: unknown): boolean => {
    if (typeof value === "string") return value.trim().length > 0;
    return value != null;
  },
};
