---
title: skyl Community
description: How skyl is built, who maintains it, and how to contribute.
---

<Intro>

skyl is an open-source Go library under the Apache 2.0 licence. This section
covers how the project is run, the standards a change has to meet, and the
security and privacy commitments the library makes to the people who deploy it.

</Intro>

## Contributing

skyl is a small library with an unusually explicit standard for what "done"
means. Before opening a pull request, read the
[Engineering Rules](/community/engineering-rules) — they are the checklist a
reviewer actually applies, and they will save you a round trip.

<CardGrid>

<YouWillLearnCard title="Contributing" path="/community/contributing">
How to propose a change, the DCO sign-off requirement, and what CI will run.
</YouWillLearnCard>

<YouWillLearnCard title="Writing an Adapter" path="/community/writing-an-adapter">
`Provider` is four methods. An adapter in your own repository is a first-class citizen.
</YouWillLearnCard>

<YouWillLearnCard title="Engineering Rules" path="/community/engineering-rules">
Ten sections covering API surface, errors, testing, dependencies, and concurrency.
</YouWillLearnCard>

<YouWillLearnCard title="Code of Conduct" path="/community/code-of-conduct">
The behaviour expected of everyone participating in the project.
</YouWillLearnCard>

</CardGrid>

## Security and privacy

skyl sits directly on the path between your users' prompts and a third-party
vendor. That makes it a component a security review will look at closely, so
the project documents its behaviour rather than asking you to read the source.

<CardGrid>

<YouWillLearnCard title="Security Policy" path="/community/security">
How to report a vulnerability, and how credentials are handled.
</YouWillLearnCard>

<YouWillLearnCard title="Data Handling" path="/community/data-handling">
Exactly what leaves your process, what is kept in memory, and what is logged.
</YouWillLearnCard>

<YouWillLearnCard title="Threat Model" path="/community/threat-model">
Trust boundaries, what an authenticated gateway caller can do, and what is out of scope.
</YouWillLearnCard>

<YouWillLearnCard title="Versions" path="/community/versions">
The versioning policy, what v1.0.0 guarantees, and what it deliberately does not.
</YouWillLearnCard>

</CardGrid>

## Project direction

<CardGrid>

<YouWillLearnCard title="Roadmap" path="/community/roadmap">
What stands between skyl and production use, from an honest audit.
</YouWillLearnCard>

<YouWillLearnCard title="Project Plan" path="/community/project-plan">
Milestones, scope, and what is explicitly out of scope.
</YouWillLearnCard>

<YouWillLearnCard title="Decision Records" path="/community/adr">
Seven ADRs recording the load-bearing decisions and why they were made.
</YouWillLearnCard>

<YouWillLearnCard title="Releasing" path="/community/releasing">
The multi-module release process. The order is not optional.
</YouWillLearnCard>

</CardGrid>

## Current status

<ValidationSnapshot />

This is stated on the front page of the repository too. skyl's first design
principle after "never block the user from a model" is **honesty over
coverage** — it is better to say "we have not proven this" than to ship
something that looks proven and quietly is not.
