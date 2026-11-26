---
title: AI's electricity bill: what the IEA's latest numbers say about data centres
subtitle: Data-centre power use jumped again in 2025 and could roughly double by 2030. Here is what is driving it, where the bottlenecks are, and what builders can do.
date: 2026-11-21
topic: Tech & society
cover: /img/insight-energy.webp
coverAlt: Bar chart of data-centre electricity rising from 415 TWh in 2024 to 945 TWh by 2030, next to a server rack
---

Every AI answer, image and agent run ends up as electricity in a data centre somewhere. For years that was a rounding error in national energy statistics. It is not any more.

The International Energy Agency (IEA) has become the reference point for this debate, because it measures data centres in the same way it measures steel, cars or air conditioning. Its 2025 and 2026 numbers tell a clear story: demand is rising fast, AI is the main driver of growth, and the limit is increasingly the grid, not the chips.

## The headline numbers

- In its 2025 *Energy and AI* report, the IEA estimated that data centres used about **415 TWh of electricity in 2024**, roughly 1.5% of global electricity use.
- In its base case, that figure rises to about **945 TWh by 2030**, more than double.
- Data-centre electricity use then **grew by about 17% in 2025**, with AI-focused data centres growing considerably faster than the rest.
- In its *World Energy Outlook 2026*, published on 19 November 2026, the IEA points to data-centre demand of **around 1,000 TWh by 2030**, and warns that this will strain grids in the places where data centres cluster.

To put 1,000 TWh in context: that is more than the annual electricity use of most countries.

## Why demand is rising so fast

Three things are happening at once.

**Spending.** The IEA notes that capital spending by the five largest technology companies passed **$400 billion in 2025** and is expected to rise by around 75% in 2026. Much of that goes on AI servers and the buildings, cooling and power systems around them.

**Training and inference.** Training large models gets the headlines, but answering requests ("inference") is the part that grows with every new user and every new feature. Agents, which call a model many times to finish one task, multiply this further.

**Density.** AI servers pack far more power into each rack than traditional servers. That changes cooling, power distribution and, above all, how much power a single site needs from the grid.

## The bottleneck is the grid

A data centre can be built in two years or less. A new high-voltage line or substation can take much longer. The IEA's 2025 analysis describes "tightening bottlenecks": long queues for grid connections, shortages of transformers and other equipment, and local pushback where new campuses compete with homes and industry for the same supply.

This is why operators are scrambling for solutions. They are signing long-term contracts for new generation, adding on-site batteries and generation, choosing sites by grid capacity rather than by fibre or land price, and paying more attention to how flexibly they can use power at peak times.

Demand is also very concentrated. A handful of regions host a large share of the world's data centres, so national averages can hide serious local pressure.

## Efficiency is improving, but not fast enough to cancel growth

There is good news. Chips do more work per watt with each generation. Cooling is getting better. Software tricks, such as smaller distilled models, quantisation, caching and batching, cut the energy per request sharply. Some AI work is also moving onto phones and laptops, where it runs on efficient neural processors.

The catch is a familiar one from energy history: when something becomes cheaper and faster, people use much more of it. Efficiency gains so far have been outpaced by the growth in what we ask AI to do.

## What builders can do

Most teams can't choose where the grid is built. They can decide how much compute their product uses. A few habits make a real difference:

- **Use the smallest model that does the job.** A small model that is good enough for classification, routing or extraction can use a tiny fraction of the energy of the largest model.
- **Cache and reuse.** Many requests repeat. Caching answers, embeddings and intermediate results avoids paying for the same work twice.
- **Batch background work** and run it when demand, and often prices and carbon intensity, are lower.
- **Cap agent loops.** Set limits on steps, retries and tokens so a confused agent cannot burn through compute.
- **Measure it.** Track compute or tokens per task next to cost and latency. What gets measured gets optimised.
- **Ask your providers** about the energy sources and efficiency of the regions you deploy to.

## The bigger picture

AI's electricity demand isn't a reason to stop building. It is a reason to build carefully. The IEA's message is that the energy system can adapt, but only with planning: more generation, faster grid build-out, and data centres that act as flexible partners to the grid rather than as fixed, ever-growing loads.

For engineers, the lesson is simpler. Efficiency is now a product feature. The team that delivers the same result with half the compute ships something cheaper, faster and easier on the grid.

## Sources

- [Energy and AI: executive summary](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary) – IEA
- [Data centre electricity use surged in 2025, even with tightening bottlenecks driving a scramble for solutions](https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions) – IEA
- [Data centre energy consumption could double by 2030, straining grids, IEA warns](https://www.euronews.com/2026/11/19/data-centre-energy-consumption-could-double-by-2030-straining-grids-iea-warns) – Euronews
