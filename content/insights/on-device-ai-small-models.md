---
title: Small models, big shift: AI that runs on your phone
subtitle: Neural processors and compact language models are moving everyday AI from the cloud onto devices. What works on-device today, what doesn't, and how to design for both.
date: 2026-10-13
topic: AI
cover: /img/insight-ondevice.webp
coverAlt: A phone running an AI assistant offline that summarises notes, next to an NPU chip and a crossed-out cloud
---

When most people picture AI, they picture a giant data centre answering requests from around the world. That picture is still mostly right. But a growing share of everyday AI now runs somewhere much closer: on the phone in your pocket or the laptop on your desk.

## Why now

Two trends met.

**Hardware.** Most new phones and laptops include an **NPU** (neural processing unit), a part of the chip designed specifically for the maths behind AI models. NPUs run that maths far more efficiently than a general-purpose processor, which matters enormously on battery power. Chipmakers and platform owners have also built the software to use them; Google and MediaTek's work on running models through LiteRT on MediaTek NPUs is one example.

**Models.** Language models have become dramatically more capable at small sizes. Models of roughly **0.5 to 14 billion parameters** can now summarise, rewrite, classify, extract and answer questions well enough for many everyday tasks, and the smaller end of that range fits comfortably on a modern phone.

Counterpoint Research expects **generative-AI-capable smartphones to make up about 45% of shipments in 2026**.

## Why run AI on the device?

- **Privacy.** Your messages, photos and notes never leave the device. For health, finance and personal data, that's a big deal.
- **Speed.** No round trip to a server, so responses can start almost instantly.
- **Offline.** It works on a plane, in a basement or in a village with weak coverage.
- **Cost.** Every request handled on the device is one the provider doesn't pay to run in a data centre, and it reduces load on the grid.

## How a big model fits in a small device

A few techniques make this possible:

- **Quantisation** stores the model's numbers with fewer bits, for example 4 bits instead of 16, cutting memory use several times over with a small loss in quality.
- **Distillation** trains a small "student" model to imitate a large "teacher", keeping much of its skill at a fraction of the size.
- **Pruning** removes parts of the network that contribute little.
- **Task-specific tuning** turns a small general model into a strong specialist, for example for summarising meetings or sorting emails.

## The limits are real

On-device AI isn't a replacement for the cloud.

- **Memory** is the hard ceiling. A phone has to share its memory between the model, the app and everything else that's running.
- **Battery and heat.** Long generations drain power and warm the device, which can make it slow itself down.
- **Capability.** Small models are weaker at long, complex reasoning, broad world knowledge and very long documents.
- **Updates.** Shipping a new model to millions of devices is slower than updating a server.

The Deloitte *Technology, Media and Telecommunications Predictions 2026* report makes the balance clear: even with on-device AI growing fast, **most AI computing will still happen in data centres** for the foreseeable future.

## The winning pattern: hybrid

The most practical products use both, routing each task to the right place:

1. **On-device first** for quick, private and frequent tasks: autocomplete, smart replies, summarising a notification, transcribing a voice note, finding a photo.
2. **Cloud when needed** for heavy tasks: long research, large documents, complex code or anything requiring up-to-date knowledge.
3. **Clear signals to the user** about where their data goes, and controls to keep sensitive tasks local.

## Ideas for builders

- **Start with a narrow task.** Small models shine on focused jobs with clear outputs.
- **Measure on real devices,** including older and mid-range phones, not just the latest flagship.
- **Design graceful fallbacks** for devices without an NPU or with too little memory.
- **Keep sensitive data local by default** and make sending to the cloud an explicit choice.
- **Watch download size.** A model of several hundred megabytes is a real cost for users on limited data plans.

## The takeaway

The future of AI isn't only bigger models in bigger data centres. It is also smaller, sharper models running privately and instantly on the devices people already own. The best products will be the ones that know which job belongs where.

## Sources

- [MediaTek NPU and LiteRT: powering the next generation of on-device AI](https://developers.googleblog.com/en/mediatek-npu-and-litert-powering-the-next-generation-of-on-device-ai/) – Google for Developers
- [On-device LLMs in 2026: what changed, what matters, what's next](https://www.edge-ai-vision.com/2026/01/on-device-llms-in-2026-what-changed-what-matters-whats-next/) – Edge AI and Vision Alliance
- [Research on on-device language models](https://arxiv.org/abs/2511.22334) – arXiv
