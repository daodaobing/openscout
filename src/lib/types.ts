export type Report = {
  openscoutScore: number;
  openscoutLabel: "recommended" | "watch" | "not_recommended" | "focus";
  oneLineVerdict: string;
  recommendedDirection: string;
  recommendationScore: number;
  mvpCycleWeeks: number;
  riskLevel: "low" | "medium" | "high";
  projectBasics: ProjectBasics;
  commercialValue: CommercialValue;
  monetizationStatus: MonetizationStatus;
  opportunityAnalysis: OpportunityAnalysis;
  riskAnalysis: RiskAnalysis;
};

export type ProjectBasics = {
  fullName: string; description: string; stars: number;
  forks: number; openIssues: number; language: string;
  license: string | null; topics: string[];
  lastPushed: string | null; createdAt: string;
  ownerAvatar: string; ownerLogin: string;
  category: string; techStack: string[];
  engineeringHealth: "excellent" | "good" | "fair";
  commits30d: number; contributorCount: number;
  hasReadme: boolean; hasCiCd: boolean; hasDocker: boolean;
  hasExamples: boolean; hasWebsite: boolean;
};

export type CommercialValue = {
  painPoint: string;
  userValue: "high" | "medium" | "low";
  enterpriseWillingness: "high" | "medium" | "low";
  marketSize: "large" | "medium" | "small";
  competitionLevel: "low" | "medium" | "high";
  marketMaturity: "early" | "growth" | "crowded";
  score: number;
};

export type ThirdPartyProduct = {
  name: string; description: string; url: string; revenueModel: string;
};

export type MonetizationStatus = {
  hasOfficialCommercial: boolean;
  hasPricingPage: boolean;
  hasEnterprisePage: boolean;
  officialProductName: string;
  thirdPartyProducts: ThirdPartyProduct[];
  marketValidationScore: number;
};

export type Opportunity = {
  name: string; score: number; reason: string;
};

export type OpportunityAnalysis = {
  top3: Opportunity[];
  notRecommended: Opportunity[];
  score: number;
};

export type RiskFactor = {
  type: "license" | "technical" | "market" | "business";
  severity: "low" | "medium" | "high";
  description: string;
};

export type RiskAnalysis = {
  factors: RiskFactor[];
  overallRisk: "low" | "medium" | "high";
  score: number;
};

export type LlmInput = {
  fullName: string; description: string; stars: number;
  readmeExcerpt: string; category: string; techStack: string[];
  hasPricingPage: boolean; hasEnterprisePage: boolean;
  engineeringHealth: string; releaseCount: number;
  contributorsCount: number; commits30d: number;
};

export type LlmOutput = {
  painPoint: string;
  userValue: "high" | "medium" | "low";
  enterpriseWillingness: "high" | "medium" | "low";
  marketSize: "large" | "medium" | "small";
  competitionLevel: "low" | "medium" | "high";
  marketMaturity: "early" | "growth" | "crowded";
  top3: Opportunity[];
  notRecommended: Opportunity[];
  oneLineVerdict: string;
  recommendedDirection: string;
  mvpCycleWeeks: number;
  riskLevel: "low" | "medium" | "high";
  riskFactors: RiskFactor[];
};
