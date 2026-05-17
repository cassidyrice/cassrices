---
layout: default
title: Home
description: Cassrices is a public ship log for finished projects, tools, agents, and experiments.
---

<section class="hero">
  <p class="eyebrow">Ship log</p>
  <h1>Cassrices</h1>
  <p class="dek">Finished projects, published as compact build notes. Each post is a shipped tool, prototype, agent workflow, or product surface.</p>
  <div class="actions">
    <a class="button primary" href="{{ '/projects/' | relative_url }}">View shipped projects</a>
    <a class="button" href="{{ '/now/' | relative_url }}">Current focus</a>
  </div>
</section>

<h2>Latest shipments</h2>

<div class="project-grid">
{% for post in site.posts limit:6 %}
  <a class="project-card" href="{{ post.url | relative_url }}">
    <span class="date">{{ post.date | date: '%Y-%m-%d' }} · {{ post.status | default: 'Shipped' }}</span>
    <h3>{{ post.title }}</h3>
    <p>{{ post.description }}</p>
  </a>
{% endfor %}
</div>
