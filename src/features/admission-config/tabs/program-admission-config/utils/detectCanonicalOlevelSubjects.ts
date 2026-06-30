export type OlevelSubjectLike = {
  id?: number;
  code?: string | null;
  name?: string | null;
};

export type CanonicalOlevelSubjectDetection = {
  hasEnglish: boolean;
  hasMathematics: boolean;
};

function matchesEnglish(subject: OlevelSubjectLike): boolean {
  const code = subject.code?.toUpperCase() ?? "";
  const name = subject.name?.toUpperCase() ?? "";
  return code.includes("ENGLISH") || name.includes("ENGLISH");
}

function matchesMathematics(subject: OlevelSubjectLike): boolean {
  const code = subject.code?.toUpperCase() ?? "";
  const name = subject.name?.toUpperCase() ?? "";
  return (
    code.includes("MATHEMATICS") ||
    code.includes("MATH") ||
    name.includes("MATHEMATICS") ||
    name.includes("MATH")
  );
}

export function detectCanonicalOlevelSubjects(
  subjects: OlevelSubjectLike[],
): CanonicalOlevelSubjectDetection {
  return {
    hasEnglish: subjects.some(matchesEnglish),
    hasMathematics: subjects.some(matchesMathematics),
  };
}

export function pickCanonicalEnglishSubjectId(
  subjects: OlevelSubjectLike[],
): number | null {
  const match = subjects.find(matchesEnglish);
  return match?.id ?? null;
}

export function pickCanonicalMathematicsSubjectId(
  subjects: OlevelSubjectLike[],
): number | null {
  const match = subjects.find(matchesMathematics);
  return match?.id ?? null;
}
