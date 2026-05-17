---
layout: post
title: "Eight Diamonds Navigator"
description: "A personal Pi agent skill for daily 8♦ Cardology navigation using the local Cardology CLI as source of truth."
date: 2026-05-17 02:00:00 -0400
status: Shipped local agent
stack: "Pi skills, Python helper, prompt templates, local Cardology CLI"
demo: ""
repo: ""
tags:
  - cardology
  - personal-agent
  - cli
  - shipped
---

## What it does

Eight Diamonds Navigator is a local agent skill for daily reflection around the `1991-02-17` profile: birth card `8♦`, PRC `5♣`.

It can generate daily snapshots, weekly prompts, question-based guidance, and card-context summaries.

## Why I built it

The personal agent needed durable instructions, prompt templates, and a helper script instead of relying on chat memory.

The core rule: the Cardology CLI is the source of truth. The agent can interpret and reflect, but it cannot invent or alter card facts.

## How it works

Artifacts:

```text
~/.pi/agent/skills/eight-diamonds-navigator/SKILL.md
~/.pi/agent/skills/eight-diamonds-navigator/scripts/eight_diamonds_snapshot.py
~/.pi/agent/prompts/eight-daily.md
~/.pi/agent/prompts/eight-week.md
~/.pi/agent/prompts/eight-question.md
~/.pi/agent/prompts/eight-snapshot.md
```

The helper calls the local Cardology CLI and the skill turns the output into practical reflection.

## What shipped

- A Pi skill for the 8♦ profile.
- A Python helper for deterministic snapshots.
- Prompt templates for daily, weekly, question, and snapshot workflows.
- A durable memory record of the operating rules.

## What I learned

Personal agent behavior should live in files. Durable skills and prompts beat temporary chat context.

## Next version

Connect the Navigator to the One-Line Meaning Interface so the daily answer has the same source-backed JSON contract as the public Blueprint Vault.
