# AOS inspiration 0 — design

Study this package to understand the **mood, layout, typography, spacing, visual hierarchy, and interaction rhythm** of the authored AOS design. Combine those qualities with the existing **Accelerate / Acceleration Chamber** design system to develop one coherent AOS interface.

This is a design reference and handoff. It does not implement a new interface or replace the current application's design contract.

## Start here

1. Read [IDEA.md](IDEA.md) for the product and research workflow.
2. Read [DESIGN.md](DESIGN.md) and [START_HERE.md](START_HERE.md) for the Acceleration Chamber direction.
3. Open [example.html](example.html) and [the Swarm print specimen](AOS%20%C2%B7%20Swarm%20%28print%29.pdf) to study composition and density.
4. Inspect [REFERENCE_INDEX.md](REFERENCE_INDEX.md) and its desktop/mobile images in [references](references). Understand what each reference contributes before borrowing from it.
5. Unpack [AOS Design System.zip](AOS%20Design%20System.zip) outside the source tree to inspect the authored tokens, component examples, component prompts, and brand guidelines. The uploaded Acceleration Chamber brief is included inside it.
6. For CLI work, read [TERMINAL-DESIGN.md](TERMINAL-DESIGN.md), a snapshot of the current AOS terminal contract. It contains later terminal-specific decisions that supersede earlier illustrative examples.

The original brief/reference bundle is also preserved as [AOS-ACCELERATION-CHAMBER-CLAUDE-DESIGN.zip](AOS-ACCELERATION-CHAMBER-CLAUDE-DESIGN.zip). The two archives serve different purposes: the first contains the authored component system; the second contains the seed brief and mood references.

## Figure out the mood before designing

Explain what makes this work feel like serious research infrastructure: committed cobalt, white, and void fields; thin contemporary typography; hard edges; large negative space; a quiet perimeter; and localized intensity where work converges or a decision becomes consequential.

Study the relationships behind the layout. Identify the dominant focal event, the primary work field, conditional inspector, navigation rails, decision strip, image rhythm, and progressive disclosure. Compare desktop and mobile references. Determine which proportions establish hierarchy and which are specific to a specimen.

Study the aperture, recursive branches, convergence, and generation boundaries as representations of real work. Each visual device should communicate an identifiable state, causal relationship, or action.

## Combine with the existing Accelerate system

Treat “Accelerate” here as the existing AOS **Acceleration Chamber** direction, named in the supplied design brief. These sources already share that foundation; reconcile their details rather than inventing two competing themes.

- Keep the existing system's functional state colors, aperture language, hierarchy, evidence lineage, decision gates, and accessible controls.
- Use the authored examples and mood references to strengthen composition, typography, field contrast, spacing, and the balance between calm framing and active work.
- Map reference qualities into the existing tokens and components. Record any proposed token changes and the reason for them before spreading new values through the interface.
- Resolve conflicts explicitly. Preserve current product behavior and later surface-specific rules. Translate dashboard relationships into terminal-native patterns for CLI work.
- Keep agent ownership, model/runtime state, evidence, cost, uncertainty, and next actions readable. Visual atmosphere must support operation.
- Preserve keyboard access, narrow-screen legibility, reduced motion, and meaning without color.

The resulting design should feel deliberate across CLI and dashboard while respecting the affordances of each surface.

## Expected design handoff

Produce a short mood/layout analysis, a mapping from reference qualities to existing components, a list of conflicts and their resolutions, and representative desktop/mobile compositions. For terminal work, include a narrow-terminal composition. Explain how the combined direction improves hierarchy and usability.

Use the authored package as the source. Reference screenshots are inspiration for mood and composition; do not copy third-party branding, artwork, wording, or exact layouts. Generated mockups from the older project are not included as design authority.

## Provenance

Copied from the older AOS project's `public/techno-renaissance/design system` directory. The archives, reference images, examples, and source briefs are preserved unchanged. `TERMINAL-DESIGN.md` is a snapshot of the current repository's terminal brief at the time of this handoff. [SOURCE-SHA256.json](SOURCE-SHA256.json) records the SHA-256 of each supplied source file.
