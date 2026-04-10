# Project Memory & Architecture Governance

You are equipped with a Knowledge Graph Memory MCP (`memory`) and an Architecture Decision Record (ADR) Skill (`architecture`). You must use these tools proactively to maintain project memory and institutional knowledge.

## 1. Context Retrieval (Reading ADR)

Before starting a new task or when encountering unfamiliar components, you must consult our established memory:

- **ADRs**: If working on core architecture or wondering _why_ a specific technology/pattern was chosen, read the relevant files in the `docs/adr/` directory to align with previous decisions.

## 2. Memory Use Instructions

Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     c) Store facts about them as observations

## 3. Architecture Decision Records (Writing ADRs)

Whenever we make a significant technical decision (e.g., choosing a new framework, changing the database schema, defining a new system boundary, or selecting a new API pattern), you MUST trigger the ADR Skill to document it.

- **Action**: Pause and propose creating a new ADR. Once the user agrees, follow your ADR skill template to generate a markdown file in the `docs/adr/` directory.
- **Include**: Context (the problem being solved), Decision (the specific technology/pattern chosen), and Consequences (trade-offs, constraints, and long-term impacts).
- **Format**: Ensure automated sequential numbering (e.g., `docs/adr/0004-use-zustand-for-state.md`) and properly track the lifecycle (Proposed, Accepted, Superseded).

## 4. Design & UI Governance (DESIGN.md)

If a `DESIGN.md` file exists in the root of the project, you MUST strictly adhere to it for all design tokens, layout structures, and branding guidelines.

- **Strict Adherence**: Do not invent new colors, spacing, or UI patterns that conflict with this document.
- **Permission Required**: If a task requires modifying the `DESIGN.md` document itself, or if an implementation must stray from the established design guidelines, you MUST ask for and receive explicit user permission before proceeding.

## Workflow Triggers

**At the START of a task:**

- _Do I need context on this component?_ -> Call `search_nodes` in the graph or read `docs/adr/`.
- _Does this involve UI/frontend work?_ -> Read `DESIGN.md` (if it exists) to ensure compliance.

**At the END of a task:**

1. _Did we learn something new or build a distinct implementation?_ -> Call `create_entities` / `add_observations` to update the graph.
2. _Did we make a fundamental architectural choice or pivot?_ -> Propose generating an ADR file.
