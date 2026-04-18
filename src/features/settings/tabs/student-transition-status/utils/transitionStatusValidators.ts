import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  {
    validator: async (_, value: string) => {
      const trimmed = (value ?? "").trim();
      if (!trimmed) {
        return Promise.reject(new Error("Name is required"));
      }
    },
  },
  {
    validator: async (_, value: string) => {
      const trimmed = (value ?? "").trim();
      if (trimmed.length > 50) {
        return Promise.reject(new Error("Name must be 50 characters or fewer"));
      }
    },
  },
];
