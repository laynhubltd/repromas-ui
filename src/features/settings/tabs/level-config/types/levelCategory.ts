export type LevelCategory = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  semestersPerLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateLevelCategoryRequest = {
  name: string;
  code: string;
  description?: string | null;
  semestersPerLevel?: number;
};

export type UpdateLevelCategoryRequest = Partial<CreateLevelCategoryRequest>;
