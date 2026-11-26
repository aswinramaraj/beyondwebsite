---
title: AI coding agents are everywhere. Trust hasn't caught up.
subtitle: Most developers now work with AI agents every week, and a large share of committed code is machine-written. Here is how good teams keep quality high.
date: 2026-11-18
topic: AI
cover: /img/insight-coding.webp
coverAlt: A code editor showing a diff, with a coding agent card saying tests pass but the change needs human review
---

In 2024 most developers used AI for autocomplete: a line here, a function there. In 2026 the default is different. Coding agents read a whole repository, edit several files, run the tests, read the failures and try again, often while the developer works on something else.

The surveys this year show how fast that shift has happened, and also how carefully developers still treat the results.

## Adoption: from novelty to normal

- JetBrains surveyed more than 15,000 developers for its 2026 research and found that **90% use AI coding agents or assistants at least weekly, and 68% use them daily**.
- Stack Overflow's April 2026 pulse survey found that **59% of developers now use AI agents at work, up from 31% in 2025**. Most of that use is supervised: agents "on a leash", in Stack Overflow's words.
- Sonar's *State of Code* developer survey estimates that **AI already writes about 42% of committed code**, a share developers expect to reach around 65% by 2027.

## Trust: the number that hasn't moved

The same Sonar survey found that **96% of developers do not fully trust AI-generated code**. That isn't a contradiction. Developers use agents because they are fast, and they verify the output because they have seen what goes wrong.

The typical failures are well known by now:

- **Plausible but wrong logic.** Code that compiles, reads well and fails on an edge case nobody tested.
- **Invented APIs.** A function or library option that looks real but doesn't exist, or existed two versions ago.
- **Security slips.** Missing input validation, secrets written into code, overly broad permissions, or an outdated dependency.
- **Quiet duplication.** The agent writes a new helper instead of using the one that already exists, and the codebase slowly gets harder to maintain.
- **Review fatigue.** When an agent produces 800 lines in a minute, reviewers skim. Skimmed code is how bugs reach production.

## How effective teams work with agents

Teams that get real value from coding agents tend to change their process, not just their tools.

**Small, scoped tasks.** "Add tax to the checkout total and a test for it" works far better than "refactor checkout". Small diffs are easy to review and easy to revert.

**Tests first, or at least tests alongside.** An agent that can run a good test suite corrects most of its own mistakes. An agent working in a codebase without tests is guessing, and so is the reviewer.

**Clear project context.** Many agents read a project instruction file: build commands, conventions, folders to avoid, how to run tests. A few well-written lines prevent a lot of wrong guesses.

**Humans own the merge.** The agent proposes; a person who understands the change approves. Branch protection, required reviews and CI checks apply to agent pull requests exactly as they do to human ones.

**Automated guardrails.** Linters, type checks, dependency and secret scanning, and static analysis catch whole classes of problems before a reviewer even looks.

**Least privilege.** Agents run in sandboxes, with access only to the repository and tools they need, and never with production credentials.

## A review checklist for agent-written code

Before approving an agent's pull request, ask:

1. Do I understand what every changed file does, and why it changed?
2. Are there tests that would fail if this change were wrong?
3. Does it reuse existing code, or reinvent it?
4. Does it handle errors, empty inputs and unexpected values?
5. Does it add a dependency? Is that dependency maintained and necessary?
6. Does it touch authentication, payments, personal data or permissions? If so, review it twice.

## What this means for people learning to code

A common worry is that agents make learning to program pointless. The evidence points the other way. When an agent writes the first draft, the valuable skills are the ones it can't supply: understanding the problem, reading code critically, designing tests, spotting the edge case and knowing when an answer is wrong.

The best way to build those skills is still to build real things, break them and fix them, with an agent as a fast assistant rather than a substitute for understanding.

## The takeaway

Coding agents have earned their place. They remove a great deal of routine work and make small teams much faster. But speed without verification just moves the cost to later. The teams doing this well have made one simple rule non-negotiable: the agent writes, the tests check, and a human decides.

## Sources

- [AI coding agent adoption in 2026](https://blog.jetbrains.com/research/2026/08/ai-coding-agent-adoption-2026/) – JetBrains Research
- [Agents on a leash: agentic AI remains mostly monitored at work](https://stackoverflow.blog/2026/05/27/agents-on-a-leash-agentic-ai-remains-mostly-monitored-at-work) – Stack Overflow
- [State of Code developer survey report: the current reality of AI coding](https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding) – Sonar
