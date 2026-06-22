import type { QuotaCategory } from "../types/admission-recommended-candidate";

export const RecommendationPageActionType = {
  SetCycleId: "SET_CYCLE_ID",
  SetProgramId: "SET_PROGRAM_ID",
  SetQuotaFilter: "SET_QUOTA_FILTER",
  SetPage: "SET_PAGE",
  SetSort: "SET_SORT",
  SetDrawerCandidateId: "SET_DRAWER_CANDIDATE_ID",
  SetOfferTargetId: "SET_OFFER_TARGET_ID",
  Reset: "RESET",
} as const;

export type RecommendationPageState = {
  cycleId: number | undefined;
  programId: number | undefined;
  quotaFilter: QuotaCategory | undefined;
  page: number;
  sort: string;
  drawerCandidateId: number | null;
  offerTargetId: number | null;
};

export type RecommendationPageAction =
  | {
      type: typeof RecommendationPageActionType.SetCycleId;
      cycleId: number | undefined;
    }
  | {
      type: typeof RecommendationPageActionType.SetProgramId;
      programId: number | undefined;
    }
  | {
      type: typeof RecommendationPageActionType.SetQuotaFilter;
      value: QuotaCategory | undefined;
    }
  | { type: typeof RecommendationPageActionType.SetPage; page: number }
  | { type: typeof RecommendationPageActionType.SetSort; sort: string }
  | {
      type: typeof RecommendationPageActionType.SetDrawerCandidateId;
      id: number | null;
    }
  | {
      type: typeof RecommendationPageActionType.SetOfferTargetId;
      id: number | null;
    }
  | { type: typeof RecommendationPageActionType.Reset };

export const initialRecommendationPageState: RecommendationPageState = {
  cycleId: undefined,
  programId: undefined,
  quotaFilter: undefined,
  page: 1,
  sort: "aggregateScore:desc",
  drawerCandidateId: null,
  offerTargetId: null,
};

export function recommendationPageReducer(
  state: RecommendationPageState,
  action: RecommendationPageAction,
): RecommendationPageState {
  switch (action.type) {
    case RecommendationPageActionType.SetCycleId:
      return { ...state, cycleId: action.cycleId, page: 1 };
    case RecommendationPageActionType.SetProgramId:
      return { ...state, programId: action.programId, page: 1 };
    case RecommendationPageActionType.SetQuotaFilter:
      return { ...state, quotaFilter: action.value, page: 1 };
    case RecommendationPageActionType.SetPage:
      return { ...state, page: action.page };
    case RecommendationPageActionType.SetSort:
      return { ...state, sort: action.sort };
    case RecommendationPageActionType.SetDrawerCandidateId:
      return { ...state, drawerCandidateId: action.id };
    case RecommendationPageActionType.SetOfferTargetId:
      return { ...state, offerTargetId: action.id };
    case RecommendationPageActionType.Reset:
      return initialRecommendationPageState;
  }
}
