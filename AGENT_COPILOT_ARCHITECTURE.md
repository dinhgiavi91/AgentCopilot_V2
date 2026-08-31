# Agent Copilot — System Architecture Handover

## Project Overview

**Agent Copilot** is a gamified CRM and team-growth workspace for life-insurance advisors. It is designed around a Zero-PII operating model: customer names, phone numbers, and email addresses are not stored in the operational CRM flows.

## Core Logic

All gamification accounting is persisted through Supabase in the **`xp_ledger`** table. XP awards, gifts, reward redemption, and transaction history must use the protected Supabase/RPC flows and the resulting ledger records. The frontend may refresh or subscribe to this data for presentation, but it must not treat local React state as the source of truth for point balances.

## Core UI Architecture

The client is React + Vite and uses **Tailwind CSS** for the current experience layer. Some legacy stylesheet files remain loaded for earlier modules. Key premium components, including the Agent Moment card, intentionally use Tailwind important modifiers such as `!text-white`, `!text-slate-*`, and `!text-amber-*` to preserve contrast against legacy CSS overrides.

Modal experiences use React portals or the project modal layer where appropriate. Application notifications are handled globally with **Sonner**; the global Toaster is configured for the top-right corner, a 3-second duration, a close button, and one visible toast at a time.

## Pilot V1 Feature Map

| Area | Purpose |
|---|---|
| **Radar (Leader)** | Surfaces team signals, intervention guidance, and the Leader target overview. |
| **O2O Rewards** | Supports XP reward redemption, team-scoped fulfillment, and reward status updates. |
| **Agent Moment™ Cards** | A PLG experience layer that turns reward milestones into shareable, premium recognition cards. |
| **Gamification Engine** | Writes XP activity to `xp_ledger`, supports automatic awards, manual gifting, and realtime feedback. |
| **CRM Zero-PII** | Records customer-touch activity without storing direct customer-identifying information. |

## Operational Guardrails

1. Preserve Zero-PII: do not introduce customer names, phone numbers, or email fields into CRM persistence.
2. Preserve ledger integrity: do not update point totals only in frontend state; use existing secure mutations/RPCs.
3. Keep the Tailwind entrypoint and Vite Tailwind plugin enabled. Premium UI components rely on generated utility CSS.
4. Keep reward fulfillment team-scoped and role-gated through the existing Supabase policies and RPCs.
5. Before release, run the regression suite, TypeScript check, and production build.

## Current Handover State

The Pilot V1 codebase includes the Tailwind/Sonner architecture hotfix, Leader Radar overview and eJoy guide, O2O reward fulfillment, the XP ledger-based gamification loop, and the current Agent Moment premium reward card experience.
