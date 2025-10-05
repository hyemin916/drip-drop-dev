<!--
Sync Impact Report:
Version change: [INITIAL] → 1.0.0
Modified principles: N/A (initial constitution)
Added sections:
  - Core Principles (5 principles)
  - Development Standards
  - Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (references constitution check)
  ✅ .specify/templates/spec-template.md (references requirements quality)
  ✅ .specify/templates/tasks-template.md (references TDD and testing phases)
Follow-up TODOs: None
-->

# Hamlog Constitution

## Core Principles

### I. Code Quality First

All code MUST meet verifiable quality standards before merge:
- Clear, self-documenting code with minimal comments explaining "why" not "what"
- Consistent naming conventions and code style enforced by automated tools
- Cyclomatic complexity ≤ 10 per function; functions ≤ 50 lines
- No duplicated code blocks > 6 lines without refactoring
- All public APIs documented with clear contracts and examples

**Rationale**: Technical debt compounds exponentially. Prevention is cheaper than remediation. Quality standards ensure maintainability and reduce cognitive load for all contributors.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD MUST be strictly followed for all feature work:
- Write tests FIRST, get user approval, verify tests FAIL, then implement
- Red-Green-Refactor cycle enforced: failing test → minimal passing code → refactor
- Test coverage MUST be ≥ 80% for new code; existing code gradually improved
- Contract tests required for all external interfaces and API boundaries
- Integration tests required for all user-facing workflows

**Rationale**: TDD ensures requirements clarity, prevents over-engineering, creates living documentation, and enables fearless refactoring. Tests written after implementation inevitably miss edge cases and test what was built rather than what should be built.

### III. User Experience Consistency

All user-facing interfaces MUST provide predictable, cohesive experiences:
- Consistent design patterns across all touchpoints (CLI, API, UI)
- Clear, actionable error messages with recovery guidance
- Response time feedback for operations > 200ms
- Accessibility standards (WCAG 2.1 AA minimum) for all interfaces
- Graceful degradation and clear feature availability communication

**Rationale**: Users form mental models through interaction patterns. Inconsistency creates friction, increases support burden, and erodes trust. Predictability reduces cognitive load and accelerates user proficiency.

### IV. Performance as a Feature

Performance requirements MUST be defined, measured, and enforced:
- Response time targets specified per operation type (p50, p95, p99)
- Resource consumption limits defined (memory, CPU, network, storage)
- Performance regression tests in CI pipeline
- Profiling required before optimization; measure before and after
- Performance budgets enforced: reject changes that exceed thresholds without justification

**Rationale**: Performance cannot be bolted on later. User expectations are set early and degradation damages reputation. Measuring prevents "death by a thousand cuts" where small regressions accumulate into user-impacting slowdowns.

### V. Incremental Delivery

Features MUST be delivered in small, independently valuable increments:
- Maximum 3 days from spec to production for any increment
- Feature flags for incomplete workflows; dark launches preferred
- Backward compatibility maintained; breaking changes require migration paths
- Vertical slicing: each increment delivers end-to-end value
- Early feedback loops with real users; pivot based on data not assumptions

**Rationale**: Large batches hide risk until late and delay learning. Small increments enable rapid feedback, reduce merge conflicts, minimize blast radius of defects, and maintain team momentum through frequent wins.

## Development Standards

### Code Review Requirements

- All code changes require approval from at least one peer reviewer
- Review checklist MUST verify: tests present, constitution compliance, security implications, performance impact
- Reviews focus on design and correctness, not style (automated by linting)
- Maximum 400 lines per PR; larger changes split or paired on
- Review turnaround time ≤ 24 hours; blocking reviews prioritized

### Security & Compliance

- No credentials, API keys, or secrets in version control
- Dependency vulnerability scanning in CI; critical/high severity blocks merge
- Input validation for all external data sources
- Audit logging for all authentication, authorization, and data modification events
- Data retention and privacy requirements documented per feature

### Documentation Standards

- Architecture Decision Records (ADRs) for significant technical choices
- API contracts versioned and published; changes communicated proactively
- Quickstart guides MUST enable new users to complete core workflow in < 10 minutes
- Runbooks for all operational procedures; tested during chaos days

## Quality Gates

### Pre-Merge Gates (CI Enforcement)

All checks MUST pass before merge:
- ✅ All tests pass (unit, integration, contract)
- ✅ Code coverage ≥ 80% for changed files
- ✅ Linting and formatting checks pass
- ✅ No high/critical security vulnerabilities
- ✅ Performance regression tests pass
- ✅ Build succeeds on all target platforms

### Pre-Release Gates

Additional validation before production deployment:
- ✅ Manual acceptance testing of user scenarios
- ✅ Accessibility audit passed
- ✅ Performance testing under expected load
- ✅ Documentation updated (user-facing changes)
- ✅ Rollback plan documented and validated

## Governance

### Amendment Process

Constitution amendments require:
1. Proposal with rationale and impact analysis documented
2. Team discussion and consensus (not unanimity; address concerns raised)
3. Update to this document with version bump per semantic versioning
4. Migration plan for changes affecting existing work
5. Communication to all stakeholders
6. Review after 30 days to assess effectiveness

### Versioning Policy

- MAJOR: Backward incompatible principle removals or fundamental redefinitions
- MINOR: New principles added or existing principles materially expanded
- PATCH: Clarifications, wording improvements, non-semantic refinements

### Compliance & Review

- Constitution supersedes other practices and guidelines
- All code reviews MUST verify constitutional compliance
- Quarterly retrospectives assess adherence and identify friction points
- Violations require documented justification; patterns trigger amendment discussion
- New team members onboarded with constitution overview; questions encouraged

### Flexibility & Exceptions

Complexity sometimes necessitates principle violations:
- All deviations MUST be documented in Complexity Tracking section of implementation plan
- Justification MUST explain why simpler alternatives are insufficient
- Exceptions reviewed in retrospectives; patterns may indicate principle refinement needed

**Version**: 1.0.0 | **Ratified**: 2025-10-05 | **Last Amended**: 2025-10-05
