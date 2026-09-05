# Razorpay SmartHaggle – AI‑Powered Agentic Commerce Workspace

## Overview
SmartHaggle is a single‑viewport web app that demonstrates:
- Real‑time price negotiation via an autonomous conversational assistant.
- A hard‑coded 15 % discount safety gate (bounded‑money requirement).
- A Local‑First offline sync engine that buffers transactions when the network drops and flushes them when connectivity returns.
- An immersive glass‑morphed UI with a 3‑D matrix that reacts to cursor movement.

## Features
- **Inline receipt** – rendered inside the chat panel (no modal).
- **“The Offer” button** – toggles offline mode from the top navigation.
- **Persistent layout** – scrollbar gutter is always present to prevent left‑shift on refresh.
- **Responsive split‑grid** – left catalog, right conversational assistant, both stretch to full height.

## Installation & Running
```bash
# Clone the repository
git clone https://github.com/yourusername/razorpay-smarthaggle.git
cd razorpay-smarthaggle

# Serve the app (any static server will do)
npx -y http-server .  # or open index.html directly in a browser
