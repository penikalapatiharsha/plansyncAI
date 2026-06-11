# backend/app/services/ai_service.py
import os
import json
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Optional

# 1. Maintain our structured data contract
class AutoEnrollmentConfig(BaseModel):
    is_enabled: bool = Field(description="True if the plan automatically enrolls eligible new employees.")
    default_percentage: Optional[float] = Field(description="The default pre-tax contribution rate percentage, or null.")

class MatchingLogicConfig(BaseModel):
    has_match: bool = Field(description="True if the company offers a matching contribution.")
    formula_description: str = Field(description="Detailed text breakdown of the matching tiers and limits.")

class PlanConfigurationSchema(BaseModel):
    company_name: str = Field(description="The formal legal name of the employer corporation.")
    auto_enrollment: AutoEnrollmentConfig
    employer_matching_logic: MatchingLogicConfig


# 2. Define Agent 1: The Implementation Engineer
def run_implementation_agent(client: OpenAI, raw_text: str) -> PlanConfigurationSchema:
    print("🤖 [Agent 1]: Compiling baseline system configuration...")
    system_instruction = (
        "You are a Staff Systems Implementation Engineer in Fidelity Workplace Investing. "
        "Analyze the text from a corporate retirement plan document and extract the "
        "system configuration variables according to the provided schema parameters."
    )
    
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": raw_text},
        ],
        response_format=PlanConfigurationSchema,
        temperature=0.0
    )
    return completion.choices[0].message.parsed


# 3. Define Agent 2: The QA Auditor
def run_auditor_agent(client: OpenAI, raw_text: str, drafted_config: str) -> str:
    print("🕵️‍♂️ [Agent 2]: Auditing draft configuration against raw source text...")
    system_instruction = (
        "You are a Senior Risk Compliance Auditor in Fidelity Workplace Investing. "
        "Your job is to read a drafted configuration JSON alongside the raw plan document text "
        "and find discrepancies, missed limitations, or errors.\n\n"
        "If the configuration is 100% complete and accurate based on the text, reply ONLY with the word 'APPROVED'.\n"
        "If you find an error or missing detail, provide specific, corrective feedback telling the engineer exactly what to change."
    )
    
    user_payload = f"RAW TEXT:\n{raw_text}\n\nDRAFT CONFIGURATION:\n{drafted_config}"
    
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_payload}
        ],
        temperature=0.0
    )
    return completion.choices[0].message.content


# 4. Define Agent 1's Revision Function
def run_revision_agent(client: OpenAI, raw_text: str, incorrect_config: str, auditor_feedback: str) -> PlanConfigurationSchema:
    print("🔄 [Agent 1]: Reviewing auditor feedback and correcting system rules...")
    system_instruction = (
        "You are a Staff Systems Implementation Engineer. Your previous draft configuration was rejected by the Auditor.\n"
        "Review their feedback, look back at the raw document text, fix the discrepancies, and output a corrected configuration schema."
    )
    
    user_payload = (
        f"RAW TEXT:\n{raw_text}\n\n"
        f"PREVIOUS ERRONEOUS CONFIG:\n{incorrect_config}\n\n"
        f"AUDITOR CORRECTION FEEDBACK:\n{auditor_feedback}"
    )
    
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_payload}
        ],
        response_format=PlanConfigurationSchema,
        temperature=0.0
    )
    return completion.choices[0].message.parsed


# 5. Master Multi-Agent Orchestration Loop
def parse_text_to_schema(raw_text: str) -> PlanConfigurationSchema:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Pass 1: Build Draft
    config_obj = run_implementation_agent(client, raw_text)
    
    # Loop Constraint to prevent infinite run costs
    max_iterations = 3
    for iteration in range(max_iterations):
        config_json_str = json.dumps(config_obj.model_dump(), indent=2)
        
        # Pass 2: Audit Draft
        audit_result = run_auditor_agent(client, raw_text, config_json_str)
        print(f"📡 Auditor Feedback (Iteration {iteration + 1}): {audit_result.strip()}")
        
        if "APPROVED" in audit_result.upper():
            print("✅ [System]: Configuration safely verified by Multi-Agent Loop.")
            return config_obj
            
        # Pass 3: Revise if auditor gives negative feedback
        config_obj = run_revision_agent(client, raw_text, config_json_str, audit_result)
        
    print("⚠️ [System]: Loop hit max execution capacity. Serving latest refined draft state.")
    return config_obj