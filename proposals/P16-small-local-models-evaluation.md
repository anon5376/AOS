# P16: Evaluate small local models on bounded subtasks (quality, time, cost)

- **Edge or parity:** unknown. Hermes manages local models itself (managed llama.cpp, hardware-aware quant choice; `hermes-delta.md` row 19), so on local-model *management* Hermes is ahead and ACS should not copy it. The open question for ACS is narrower and measurable: can a small local worker take suitable subtasks on the bus, with a frontier reviewer, at acceptable quality and lower cost? That is a hypothesis.
- **Cost:** S for the evaluation; the result may recommend no code.
- **Risk:** low (an experiment); the risk is over-reading a small result.
- **Targets:** TypeScript runner reusing P01; no schema change.
- **Status:** proposed. Run after P01.
- **Depends on:** P01 (task set, extractor), P05 (cost and time per task). P03 makes the frontier-reviewer arm meaningful.

## Problem

MANIFESTO: "Eventually, small local models may handle suitable parts of the work or help improve the system while larger agents continue researching. That direction must be tested against quality, time, and cost." Nothing in ACS tests it. The only local-model evidence in the repo is an anecdote in the setup guide that one 7B coder model fails tool calls and others work.

## Evidence

- ACS reaches local models only through harnesses: Codex `--oss` and OpenCode with Ollama; the guide states `qwen2.5-coder:7b` "fails here" for tool calls and lists models that work (`docs/free-ai-setup.md:104-120`). `docs/provider-support.md` marks Ollama a "Researched path", not an adapter.
- A direct path exists: `qagent-openai-compatible` (`src/openai-compatible-harness.ts`, 87 lines; bin entry `package.json:25`) is a one-shot CLI that posts a prompt to any OpenAI-compatible endpoint (default `http://127.0.0.1:1234/v1`) and can be run through the generic `command` adapter (`src/adapters.ts:173-190`). It has no tool calling, so it suits text-only subtasks that the supervisor auto-submits for the agent, not bus-tool-driven work.
- There is no quality, time or cost measurement for any model class: usage is not recorded per task (`src/core/db.ts:63`, P05) and no benchmark exists (P01).
- The roster field `cheap-worker` exists as a role (`agent-bus.config.json`, role `cheap-worker`: "Handles lookups, summaries and narrow low-risk work"), but nothing assigns real work to it by evidence.

## Change

An evaluation, not a feature. Using the benchmark's local sub-benchmark (`benchmark.md`):

1. Pick candidate subtasks with machine-checkable outcomes: running a validator and reporting its output verbatim, summarising a log into a fixed template, drafting a commit message from a diff, listing the call sites of a named function (a checkable subset of R01/R02), and the three cheapest implementation tasks (I01, I02, I09).
2. Run each with a local model as worker and a frontier model from a different family as reviewer (P03 if available, else assigned by hand), versus the frontier model alone as worker. Models: the smallest that completes tool calls reliably on the owner's hardware, plus one mid-size. Record hardware (CPU, GPU, RAM), quantisation and runtime version.
3. Report per subtask type: accepted/total, first-round acceptance, wall-clock minutes, tokens, USD for the frontier part, an electricity-free "0 USD" for the local part with the wall-clock and hardware stated, and defect escape (hidden validators).
4. Decide per subtask type: *offload*, *do not offload*, or *inconclusive*. Only "offload" with a margin earns a routing rule (an advisory route in P04, never a hard-coded one).

## Cost

An afternoon to wire the local harness into `bench/` plus run time on the owner's machine. Cloud sessions cannot run it (no GPU, no local runtime).

## Risk

- **Hardware dependence:** results hold for the tested machine and quantisation only; say so in the report.
- **Small n:** a handful of subtasks per type. Report counts and refuse to generalise; "inconclusive" is a valid outcome.
- **Tool-call fragility:** small models often fail at tool calling rather than at the task; separate "failed to call tools" from "wrong answer" in the report.
- **Cost accounting honesty:** local inference is not free; record time and power class, do not print "0 USD" without that context.

## How it is verified

- The sub-benchmark runs end to end with a fake local server (CI) and with a real local model on the owner's machine.
- Report contains, for each subtask type, the counts, the decision and the evidence links (run ids, event seqs).
- No routing rule merges without an "offload" decision backed by a report that names the hardware and models.
