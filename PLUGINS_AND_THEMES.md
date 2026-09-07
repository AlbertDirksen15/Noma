# Noma extensions

Noma will use a WordPress-style extension model: the Core stays updateable,
while optional functionality and appearance live in independent plugins and
themes. This document defines the compatibility direction before the SDK is
implemented.

## Themes

The first theme format will be declarative. A theme will provide a manifest and
design tokens such as colors, typography, spacing and card appearance. Themes
will not run arbitrary code in the first release. Users will choose an active
theme in Noma settings and may return to the bundled default theme at any time.

## Plugins

Every plugin will have a manifest with a stable identifier, name, version,
author, compatible Noma Core versions and requested permissions. Noma will
load plugins through a documented API rather than by letting them edit Core
files. The first API will provide limited UI slots and note/project events.

Like WordPress actions and filters, Noma actions will notify a plugin about an
event, while Noma filters will receive a value and return a replacement value.
Initial examples include `note.created`, `note.saved`, `project.opened` and a
card-title filter. Permission prompts will be required before a plugin can
read workspace data, use the network or store its own data.

## Publishing

Anyone may distribute a theme or plugin independently. A future official Noma
catalogue may review extensions for security and compatibility, but it will
not prevent independent distribution. The official catalogue, Noma Sync and
Noma Mobile are separate products and are not part of Noma Core.

## Licensing

Noma Core is GPL-3.0-or-later. Themes and plugins published for the official
catalogue must use GPL-3.0-or-later or a GPL-compatible license. Until the
extension boundary is implemented and legally reviewed, authors should assume
that code importing Noma Core APIs must be GPL-compatible. Assets that are not
code, such as screenshots and fonts, need their own clear redistribution
rights.

The Noma name and logo have no registered trademark status in this repository.
Do not represent an independently distributed extension as published or
reviewed by Noma unless that is true.
