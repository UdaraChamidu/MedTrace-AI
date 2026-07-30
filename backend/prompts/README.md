# Prompt registry

Prompts are immutable, reviewable v1 inputs for the bounded n8n agents. Each `agent_runs` row records the matching prompt path/version. Model IDs remain environment configuration and are not embedded in prompts.

All model calls must use strict Structured Outputs, a correlation ID, timeout, retry limit (one schema-repair retry), token accounting, and an audit record. Never send a conflicting/insufficient-identity document into clinical merge steps.
