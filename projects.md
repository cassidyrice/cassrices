---
layout: default
title: Projects
description: Every shipped Cassrices project post.
permalink: /projects/
---

<section class="hero">
  <p class="eyebrow">Archive</p>
  <h1>Projects</h1>
  <p class="dek">One post per shipped project. Short, concrete, and easy to scan.</p>
</section>

<div class="project-grid">
{% for post in site.posts %}
  <a class="project-card" href="{{ post.url | relative_url }}">
    <span class="date">{{ post.date | date: '%Y-%m-%d' }} · {{ post.status | default: 'Shipped' }}</span>
    <h3>{{ post.title }}</h3>
    <p>{{ post.description }}</p>
  </a>
{% endfor %}
</div>
