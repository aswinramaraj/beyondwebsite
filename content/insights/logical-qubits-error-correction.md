---
title: Logical qubits, explained: the real race in quantum computing
subtitle: The headline number isn't how many qubits a machine has. It's how few errors it makes. A plain-language guide to quantum error correction and why recent results matter.
date: 2026-10-27
topic: Frontier tech
cover: /img/insight-quantum.webp
coverAlt: A grid of physical qubits with a highlighted three-by-three patch forming one logical qubit, and a falling error-rate chart
---

For years, quantum computing news was a race of big numbers: 50 qubits, 100, 1,000. Those numbers made great headlines and told you surprisingly little. A thousand noisy qubits that make an error every few hundred operations can't run anything useful for long.

The question that matters now is different: **how many reliable operations can a machine perform before an error ruins the result?** The answer depends on something called a logical qubit.

## Why qubits are so fragile

A classical bit is 0 or 1, and modern chips almost never flip one by accident. A qubit can hold a blend of 0 and 1 at the same time, and that delicate state is disturbed by almost anything: heat, stray electromagnetic fields, tiny flaws in materials, even the act of controlling it.

Today's best physical qubits still make an error roughly once in every thousand operations, give or take, depending on the hardware. Useful quantum algorithms, such as simulating complex molecules, need millions or billions of operations in a row. The gap is enormous.

## The fix: spread one qubit across many

Quantum error correction tackles this the way storage systems protect data: with redundancy. Instead of storing information in one physical qubit, you spread it across many and keep checking for errors.

There is a twist. You can't simply copy a qubit or look at it directly, because measuring it destroys its quantum state. So error-correcting codes use extra **"measure" qubits** that check *relationships* between neighbouring **"data" qubits**, for example whether two of them still agree, without revealing the information itself. A classical computer reads these checks continuously, works out which error most likely happened, and corrects for it.

The group of physical qubits working together this way is a **logical qubit**. The most studied layout, the **surface code**, arranges qubits in a grid much like the one on this article's cover.

## The threshold that changes everything

Error correction only helps if the physical qubits are good enough. Adding more qubits adds more places for errors to happen. Below a certain error rate, called the **threshold**, each step up in code size suppresses errors faster than it adds them. Above it, bigger codes make things worse.

For a long time, no one had clearly shown a system operating below threshold. That has changed:

- **Google** reported that as it grew its surface-code logical qubits from small to larger grids, the logical error rate *fell* with each step. That is the signature of working below threshold.
- **Microsoft and Quantinuum** reported logical qubits whose operations were **around 800 times more reliable** than the physical qubits they were built from, and Microsoft has since been turning these demonstrations into a software platform for building logical-qubit machines.

Neither result means a useful quantum computer exists today. Both show that the core idea works in practice, which for years was not certain.

## From "quops" to "megaquops"

Researchers now often talk about **quantum operations (quops)** rather than qubit counts. A machine that can reliably run about a million operations, a "megaquop" machine, is widely seen as the next meaningful milestone. It would be the first point where quantum computers might do scientifically useful work that classical computers struggle with.

Getting there needs better physical qubits, much larger chips, and fast classical hardware that can decode error checks in real time, millions of times a second. Several companies now publicly target useful error-corrected machines before the end of this decade, though timelines in this field have slipped before.

## Why this matters outside physics labs

**For security**, error correction is what eventually makes quantum computers a threat to today's encryption. Breaking RSA would need a large number of high-quality logical qubits. That is why governments have set firm deadlines for moving to post-quantum cryptography, even though such a machine doesn't exist yet.

**For science and industry**, the first real gains are expected in chemistry and materials: catalysts, batteries and drug molecules whose behaviour is fundamentally quantum and very hard to simulate classically.

**For everyone else**, the practical advice is simple: be sceptical of headlines that only quote qubit counts, and look instead for logical qubits, logical error rates and the number of operations a system can reliably run.

## The takeaway

Quantum computing's progress is now measured in errors avoided, not qubits announced. Below-threshold error correction has moved from theory to working demonstrations. The road from here to useful machines is still long, but for the first time it is an engineering road, not a question of whether the destination exists.

## Sources

- [From research to product: logical qubit demonstrations shaping Microsoft's utility-scale quantum software platform](https://quantum.microsoft.com/en-us/insights/blogs/from-research-to-product-engineering-logical-qubit-demonstrations-shaping-microsoft-utility-scale-quantum-software-platform) – Microsoft Quantum
- [Our progress toward quantum error correction](https://blog.google/inside-google/message-ceo/our-progress-toward-quantum-error-correction/) – Google
- [Quantum computers, error correction and "megaquops"](https://www.sciencenews.org/article/quantum-computer-megaquops-error-correction) – Science News
