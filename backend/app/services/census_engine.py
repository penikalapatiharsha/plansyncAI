# backend/app/services/census_engine.py
from datetime import datetime

def cleanse_employee_census(file_stream: str, plan_rules: dict) -> dict:
    """
    Ingests a raw employee census CSV file stream, applies the AI-extracted plan rules,
    auto-corrects formatting errors, and isolates eligibility flags.
    """
    import csv
    import io

    # 1. Parse out the operational rules your AI extracted earlier
    default_pct = plan_rules.get("auto_enrollment", {}).get("default_percentage", 6)
    is_auto_enroll_enabled = plan_rules.get("auto_enrollment", {}).get("is_enabled", True)
    
    # Target date context for calculation (Current Year: 2026)
    CURRENT_YEAR = 2026
    MINIMUM_LEGAL_AGE = 21  # Standard ERISA baseline found in NVIDIA plan specs

    cleaned_records = []
    exception_flags = []

    # Read the text string stream as a CSV
    csv_file = io.StringIO(file_stream)
    reader = csv.DictReader(csv_file)

    for index, row in enumerate(reader, start=2): # Start at line 2 (skipping header)
        errors = []
        
        # --- A. DATA CLEANING & STANDARDIZATION ---
        first_name = row.get("First Name", "").strip().capitalize()
        last_name = row.get("Last Name", "").strip().capitalize()
        status = row.get("Status", "").strip().capitalize()
        
        # --- B. BUSINESS RULE VALIDATION (AGE CHECK) ---
        birth_date_str = row.get("Birth Date", "").strip()
        try:
            b_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
            age = CURRENT_YEAR - b_date.year
            if age < MINIMUM_LEGAL_AGE:
                errors.append(f"Age Violation: Employee is {age} years old. Minimum plan age is {MINIMUM_LEGAL_AGE}.")
        except ValueError:
            errors.append(f"Invalid Birth Date Format: '{birth_date_str}'")

        # --- C. AUTOMATED LOGIC ENFORCEMENT (DEFERRAL RATES) ---
        deferral_str = row.get("Auto Enroll Deferral %", "").strip()
        
        if status == "Terminated":
            # Terminated employees should not be contributing
            deferral_rate = 0
            if deferral_str and float(deferral_str) > 0:
                errors.append("Status Conflict: Terminated employee cannot have an active contribution rate.")
        else:
            # For active employees, fill in the default auto-enroll rate if blank
            if not deferral_str and is_auto_enroll_enabled:
                deferral_rate = default_pct
                # Log that the system fixed this automatically
                print(f"⚙️ Auto-corrected: Assigned default {default_pct}% deferral to {first_name} {last_name}")
            else:
                deferral_rate = float(deferral_str) if deferral_str else 0

        # Assemble the clean, enterprise-ready record
        record = {
            "row_id": index,
            "full_name": f"{first_name} {last_name}",
            "birth_date": birth_date_str,
            "hire_date": row.get("Hire Date", "").strip(),
            "calculated_deferral_percentage": deferral_rate,
            "status": status,
            "is_valid": len(errors) == 0
        }

        cleaned_records.append(record)
        
        # If the row has fatal plan violations, separate it into the exception queue
        if errors:
            exception_flags.append({
                "row_id": index,
                "employee": f"{first_name} {last_name}",
                "violations": errors
            })

    return {
        "summary": {
            "total_processed_rows": len(cleaned_records),
            "clean_records_count": len(cleaned_records) - len(exception_flags),
            "exception_count": len(exception_flags)
        },
        "clean_records": [r for r in cleaned_records if r["is_valid"]],
        "exceptions_queue": exception_flags
    }