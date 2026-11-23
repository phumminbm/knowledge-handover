# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- GitHub Pages deploys from `main` instead of from release tags, which the `github-pages` environment refuses.

## [0.1.0] - 2026-11-23

First public release.

### Added
- The `knowledge-handover` skill: giver interview, receiver teaching and update mode, with save blocks so a handover can continue across chats.
- Knowledge Pack builder shared by the Node CLI (`build_pack.js`) and the in-browser Pack Builder.
- `START-HERE.html`: urgent items, work map, step-by-step walkthroughs with the giver's real images, quizzes. Works offline.
- Plugin manifests for Claude Code (`.claude-plugin/`), Codex (`.codex-plugin/`) and other Agent Skills hosts (`.agents/plugins/`).
- `PROMPT.md` for AI chats without skill support.
- Unit tests, browser security tests and CI on every pull request.

### Security
- `START-HERE.html` now parses diagrams in an inert document and keeps only drawing elements, so a crafted save block cannot run code when a receiver opens the Pack.
- The Pack Builder shows pasted values and file names as text.
- Pack, process and image names are cleaned before they become file paths, so a save block cannot write outside the Pack folder or add `../` entries to the zip.

[Unreleased]: https://github.com/phumminbm/knowledge-handover/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/phumminbm/knowledge-handover/releases/tag/v0.1.0
