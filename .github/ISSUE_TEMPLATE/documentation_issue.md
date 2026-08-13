---
name: Documentation issue
about: A page is wrong, unclear, or missing something
labels: documentation
---

## Which page

<!-- The URL, or the path under src/content/. -->

## What is wrong

<!-- Tick whichever applies. The first two are the serious ones: this project's
     third design principle is honesty over coverage, and a page that overstates
     what works undermines that more than a page with a gap in it. -->

- [ ] It says something that is **not true** of the library
- [ ] It **omits a limitation** that matters — something silently ignored, or a
      provider that behaves differently
- [ ] Code sample does not compile, or does not do what the text says
- [ ] Unclear or hard to follow
- [ ] Missing entirely
- [ ] Broken link, typo, or formatting

## The detail

<!-- Quote the sentence. If it is a code sample, paste what you ran and what
     happened — samples marked `verify` are compiled in CI against a real skyl
     checkout, so a compile failure here is a real bug in the pipeline rather
     than a stale snippet. -->

## What it should say

<!-- Optional, and the most useful thing you can provide. -->

## Where the fix belongs

<!-- Worth a moment's thought, because the same fact lives in more than one
     place:

     - Narrative and reference pages → here, in src/content/.
     - Anything a decision depends on — an ADR, the threat model, the feature
       matrix → skyl, which is authoritative because it is versioned with the
       code. Fixing only the copy here leaves the real one wrong.
     - Deployment → skyl_infrastructure.

     If you are not sure, say so and it will be sorted out. -->
