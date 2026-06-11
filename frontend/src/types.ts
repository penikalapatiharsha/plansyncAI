// frontend/src/types.ts

export interface AutoEnrollmentConfig {
    is_enabled: boolean;
    default_percentage: number | null;
  }
  
  export interface EmployerMatchingLogic {
    has_match: boolean;
    formula_description: string;
  }
  
  export interface PlanConfiguration {
    company_name: string;
    auto_enrollment: AutoEnrollmentConfig;
    employer_matching_logic: EmployerMatchingLogic;
  }

  // Add to the bottom of frontend/src/types.ts

export interface CleanEmployeeRecord {
  row_id: number;
  full_name: string;
  birth_date: string;
  hire_date: string;
  calculated_deferral_percentage: number;
  status: string;
}

export interface CensusException {
  row_id: number;
  employee: string;
  violations: string[];
}

export interface CensusCleansingResponse {
  summary: {
    total_processed_rows: number;
    clean_records_count: number;
    exception_count: number;
  };
  clean_records: CleanEmployeeRecord[];
  exceptions_queue: CensusException[];
}