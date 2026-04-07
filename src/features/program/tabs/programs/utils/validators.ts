import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Name is required" },
  { min: 1, message: "Name must be at least 1 character" },
  { max: 150, message: "Name must be 150 characters or fewer" },
];

export const degreeTitleRules: Rule[] = [
  { required: true, message: "Degree title is required" },
  { min: 1, message: "Degree title must be at least 1 character" },
  { max: 50, message: "Degree title must be 50 characters or fewer" },
];

export const durationRules: Rule[] = [
  { required: true, message: "Duration is required" },
  { type: "integer", min: 1, max: 10, message: "Duration must be an integer between 1 and 10" },
];

export function maxResidencyRules(durationInYears: number): Rule[] {
  const ceiling = Math.floor(durationInYears * 1.5 + 1);
  return [
    { required: true, message: "Max residency is required" },
    { type: "integer", message: "Max residency must be an integer" },
    {
      validator: (_: unknown, value: number) => {
        if (value <= durationInYears || value > ceiling) {
          return Promise.reject(
            new Error(
              `Max residency must be between ${durationInYears + 1} and ${ceiling} years`
            )
          );
        }
        return Promise.resolve();
      },
    },
  ];
}
