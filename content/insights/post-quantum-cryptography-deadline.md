---
title: The post-quantum deadline just got real
subtitle: NIST has set dates for retiring RSA and elliptic-curve cryptography. Much of the web already uses post-quantum key exchange, but the hard parts are still ahead.
date: 2026-11-03
topic: Security
cover: /img/insight-pqc.webp
coverAlt: A padlock labelled ML-KEM, FIPS 203, on a lattice background, with RSA and ECC struck out and a TLS 1.3 hybrid key exchange label
---

Almost everything secure on the internet, from banking apps to software updates, relies on two families of public-key cryptography: RSA and elliptic curves. Both rest on maths problems that a large, error-corrected quantum computer could solve.

Nobody has that machine yet. But at the end of October 2026 the question changed from "if" to "by when", because the US standards body NIST put firm dates on the transition.

## What NIST decided

On 27 October 2026, NIST published the final version of **IR 8547**, its plan for moving to post-quantum cryptography. According to reports on the final document:

- Quantum-vulnerable public-key algorithms, including RSA, elliptic-curve signatures and Diffie–Hellman key exchange, are **deprecated after 2030 and disallowed after 2035** under NIST standards.
- This applies **regardless of key size**. The 2024 draft would have let stronger settings such as RSA-3072 continue until 2035. The final version doesn't.
- Related US federal rules require government systems to adopt quantum-resistant key establishment by the end of 2030.

NIST rules formally bind US federal systems, but they shape procurement, compliance and vendor roadmaps far beyond them. Some security advisers already suggest treating 2029 as the practical deadline.

## Why act before the quantum computer exists

There are two reasons.

**Harvest now, decrypt later.** An attacker can record encrypted traffic today and store it until a quantum computer can break it. If your data needs to stay secret for ten years or more, as medical records, legal files, trade secrets and government data often do, it is already at risk.

**Migrations take years.** Cryptography is buried in protocols, libraries, hardware, certificates and devices that stay in service for a decade or longer. The last big transitions, such as retiring the SHA-1 hash, took many years.

## The new algorithms

NIST published its first post-quantum standards in August 2024:

- **ML-KEM** (FIPS 203), for key exchange: agreeing on a shared secret over an untrusted network.
- **ML-DSA** (FIPS 204), for digital signatures.
- **SLH-DSA** (FIPS 205), a hash-based signature scheme kept as a conservative backup.

In 2025 NIST also selected **HQC** as a second key-exchange algorithm, based on different maths, in case a weakness is ever found in ML-KEM.

The new algorithms run on ordinary computers. Their main cost is size: keys and signatures are larger than today's, which matters for protocols, certificates and small devices.

## The good news: key exchange is well under way

On the web, the most urgent part, protecting traffic from harvest-now-decrypt-later, has moved fast. Major browsers and many servers now use **hybrid key exchange**, which combines classic X25519 with ML-KEM (shown as `X25519MLKEM768` in TLS). If either algorithm holds, the connection stays safe.

Cloudflare reports that **well over 60% of human-generated TLS traffic** to its network is now protected with hybrid ML-KEM. Cloudflare has also brought forward its own target for full post-quantum security to 2029, citing faster-than-expected progress in quantum hardware and software.

## The hard part: signatures and certificates

Signatures are a different story. A 2026 measurement study of internet readiness found that **TLS certificates remain entirely classical**: RSA and ECDSA, with no post-quantum or hybrid signatures observed in the wild.

Signatures are harder to move because they involve the whole chain of trust: certificate authorities, browsers, operating systems, hardware security modules, firmware signing and long-lived devices. Larger post-quantum signatures also make handshakes heavier. That is where most of the remaining work lies, and why 2030 is closer than it looks.

## What organisations should do now

1. **Build a cryptographic inventory.** Find where you use RSA and elliptic curves: TLS, VPNs, SSH, code signing, databases, tokens, hardware and third-party services.
2. **Rank by data lifetime.** Start with systems that protect data that must stay confidential for many years.
3. **Turn on hybrid key exchange** where your libraries, load balancers and CDNs already support it. Often it is a configuration change.
4. **Ask vendors for their roadmap.** Put post-quantum support into procurement requirements now.
5. **Design for crypto-agility.** Make algorithms configurable rather than hard-coded, so the next change is a setting, not a rewrite.
6. **Test the size impact.** Larger keys and signatures can break assumptions in packet sizes, storage fields and constrained devices.

## The takeaway

The quantum threat to today's encryption is still a future one, but the deadline for dealing with it is now fixed. Key exchange on the web shows that a fast migration is possible. The rest, especially signatures, certificates and embedded systems, needs to start this year, not in 2029.

## Sources

- [NIST starts the countdown to retire quantum-vulnerable encryption](https://www.helpnetsecurity.com/2026/10/28/nist-post-quantum-cryptography-migration-roadmap/) – Help Net Security
- [NIST IR 8547 final: post-quantum deadlines become vendor requirements](https://labs.cloudsecurityalliance.org/research/csa-research-note-nist-ir8547-pqc-transition-20261030-csa-st/) – Cloud Security Alliance
- [Post-quantum SASE](https://blog.cloudflare.com/post-quantum-sase) – Cloudflare
- [Measurement study of post-quantum readiness of the internet: 2026](https://arxiv.org/pdf/2606.16473) – arXiv
