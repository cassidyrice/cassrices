---
layout: post
title: "Cardology One-Line Meaning Interface"
description: "A deterministic Cardology CLI layer that compresses birthday timing facts into one useful line with expandable meaning layers."
date: 2026-05-17
status: Shipped prototype
stack: "TypeScript, local Cardology CLI, JSON fixtures, RAG-ready metadata"
demo: ""
repo: ""
tags:
  - cardology
  - cli
  - ai-agents
  - shipped
---

## What it does

The One-Line Meaning Interface turns deterministic Cardology facts into a compact answer that can expand into number, suit, planet, position, profile, year, source, and provenance layers.

It keeps calculation and interpretation separate:

- the local Cardology CLI determines the facts
- the one-line interface formats and layers them
- downstream UI/RAG systems can consume the JSON contract

## Why I built it

The larger product is a birthday-generated Blueprint Vault. It needs a small, reliable kernel that can answer questions like:

```bash
cardology line 1991-02-17 today
cardology ask 1991-02-17 "what should I focus on today?"
cardology ask 1991-02-17 "what is age 35 about?" --sources
```

The key idea: a single line should be useful immediately, but every claim should be expandable and auditable.

## How it works

The prototype calls the Cardology source layer, loads the compiled birthday repository when available, and emits a structured JSON payload.

Core artifact:

```text
scripts/cardology-one-line-interface.ts
```

Fixture output:

```text
examples/cardology-rag-blueprint-engine/fixtures/1991-02-17/one-line-2026-05-17.json
```

## CLI output

```text
1991-02-17 · 8♦ The Money Powerhouse · age 35 on 2026-05-17 · Venus puts 8♠ The Truth Power + 5♦ The Money Wanderer in play: Power used with grace. A change in what you value, possibly through love or aesthetic taste shifting.
```

## What shipped

- One-line output for a birthdate and target date.
- JSON output with deterministic facts and provenance.
- Layers for number, suit, planet, position, profile, year, and source context.
- A schema for downstream consumers.
- A fixture for `1991-02-17` with birth card `8♦` and PRC `5♣`.

## What I learned

The one-line interface is the right primitive. A dense product can still feel simple if the first response is compressed and the depth is available on demand.

## Next version

Wrap the prototype in a friendlier command surface and connect it directly to the Blueprint Vault Command Center UI.
