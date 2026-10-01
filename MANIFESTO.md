# AOS Manifesto

**Agentic Orchestration System**

AOS starts with a goal, the documents that matter, and the context needed to understand them. Its purpose is to turn difficult research and technical work into sustained, coordinated effort by specialized agents, with the human retaining control over the system.

This manifesto describes the system we intend to build and the principles its development must follow.

## Research comes first

AOS exists to investigate hard questions, build real things, and produce results that can be examined. Progress means a question answered, a working artifact, an uncertainty narrowed, or a failed approach explained. Output volume is a poor substitute for any of these.

Agents must work from the supplied context, seek missing evidence, and distinguish observations, assumptions, and conclusions. An unresolved question must remain visible.

## The swarm organizes itself

The system should analyze the goal and its context before distributing work. It should decide which roles are needed, give each agent a useful prompt, and organize those agents into a hierarchy that fits the problem.

Some roles can persist across a project. Others should exist only for a particular task. Agents should be able to delegate further, revise their approach, and bring findings back into a coherent result. When rethinking cannot resolve a consequential uncertainty, the system should ask the human.

## Scale must preserve coordination

The ambition is a swarm that can grow from two agents to whatever size the work justifies. Compute, provider limits, and budgets still apply; the architecture should support growth without an arbitrary fixed ceiling on the number of agents.

Workers must have clear ownership and must not overwrite, interrupt, or silently invalidate each other's work. More agents are useful only when their combined work improves the result.

Large swarms need aggregation, search, and drill-down. A human should be able to follow the goal, the task tree, dependencies, evidence, and timeline without reading every conversation.

## Everything should be configurable

> i want to be able to tweak everything mate

AOS should be open source and deeply customizable: roles, prompts, models, harnesses, routing, tools, skills, plugins, MCP servers, budgets, memory, and approval rules.

Useful defaults should make it easy to start. Clear interfaces should make those defaults easy to replace. The system should support existing agent harnesses and supported authentication methods, leaving room for a native harness as the project develops.

## One engine, multiple ways to work

The CLI and dashboard should operate on the same underlying state. Goals, agents, tasks, conversations, evidence, costs, and controls should agree across both surfaces.

The CLI should support serious keyboard-driven work. The dashboard should make the structure of that work understandable through task trees, node graphs, boards, and timelines. Both should let the human inspect, redirect, pause, and resume work.

## Every run should leave knowledge behind

Context and findings should survive individual agents. Memory should be inspectable, attributable, and configurable, with explicit boundaries between projects and conversations.

At the end of a run, AOS should record what worked, what failed, why it failed, and what could improve. Proposed improvements should become concrete changes that can be evaluated.

Self-improvement should run with the user's agreement or under a policy they have explicitly enabled. Changes need evaluation, versioning, and a way to roll back. An agent proposing an improvement does not gain permission to expand its own authority.

## Efficiency serves the goal

The aim is to accomplish more goals well, faster, and at a sustainable cost. Routing, specialization, reuse, and parallelism should earn their place through better results.

Eventually, small local models may handle suitable parts of the work or help improve the system while larger agents continue researching. That direction must be tested against quality, time, and cost.

## Autonomy must remain accountable

Every consequential action should have an identifiable actor, purpose, authority, and result. Failed tools, stalled work, missing evidence, and uncertain capabilities should be visible.

AOS should carry work forward without requiring constant supervision, while keeping intervention practical. The human sets the goal and the boundaries. The system is responsible for organizing the work, preserving the evidence, and making its result reviewable.
