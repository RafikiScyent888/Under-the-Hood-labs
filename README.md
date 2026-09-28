# Under the Hood Labs

The big, hands-on builds of the Cyber Warrior Program. You open it up, run it,
see what it is actually doing, and live with what you chose.

**Live site:** https://rafikiscyent888.github.io/Under-the-Hood-labs/

This is the "Full Tile" page for the Under the Hood Labs tile in the
[Cyber Warrior Command Center](https://rafikiscyent888.github.io/Cyber-Warrior-Command-Center-2.0/).

## What's here, in order

The order is the owner's, and it is the order to take them in.

| | Lab | What you do |
| --- | --- | --- |
| 1 | [A+ Core 1 Under the Hood Labs](https://rafikiscyent888.github.io/A-Core-1-under-the-hood-labs/) | Eight generated labs for 220-1201: RAID, printers, workstation builds, power, wireless, mobile, networking and displays. The mechanism is the point, and you live with your choices |
| 2 | [Security Start-up Firewall](https://rafikiscyent888.github.io/Security-Start-up-Firewall/) | Security+. Inherit a home network somebody set up badly, find out what it is really doing from the log, and fix it. Nothing tells you what's wrong. Five tiers, from the house to a business you run and defend |
| 3 | [Veterans Overcoming the Odds SOC](https://rafikiscyent888.github.io/Veterans-Overcoming-Odds-SOC/) | CySA+ CS0-004. You've switched seats from owner to analyst: work a live queue across five tiers, from first-shift triage to running an incident |

Each entry carries a one-line description, because none of the three names says
what the lab is, and a student arriving cold should not have to click to find out.

## Colour

The tile is **safety orange**, `#ff6a00`, chosen by the owner from three bright
oranges shown as a preview on 28 September 2026. Orange is outside the royal
palette, which is why it was previewed before it was used.

It is bright, so it carries **dark** lettering, like Security+ yellow and
Interactive Labs steel: white on it measures 2.68:1, far under any floor; navy
(`#16192e`) measures 6.03:1 against the 4.5:1 floor for its large, bold heading.
In the command center it sits right after Interactive Labs, so the two lab tiles
are together and the orange is kept away from Security+ yellow.

## Accessibility

Text meets **WCAG AAA** — 7:1 for body text, 4.5:1 for large text — measured on
painted pixels, on a desk and on a phone, at rest and with a link hovered. The
order is marked by a number in words as well as by position, and the list is an
ordered list so a screen reader announces it as one.

An easier-reading toggle is **not** on this page yet: the owner is adding it
across every site that lacks one in a single pass, once the build is finished.

## Files

**What the site needs to run:** `index.html` — one self-contained page, no
scripts, no build step.

**Not needed to run the site:** `verify/page.mjs` and this README.

## Check

```
node verify/page.mjs           # links, tile, footer, AAA on painted pixels, phone width
node verify/page.mjs --plant   # 6 planted mistakes, every one must be caught
```

Needs Playwright and Chromium.

---

Cyber Warrior Program — built by an instructor, for students, to make
certification study more interactive. For educational purposes only. Not
affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks belong to
their respective owners.
