# Changelog

## [1.1.0] - 2026-04-28

### Fixed
- **API Base URL**: Corrected the Tavus API endpoint from `api.tavus.io` to `tavusapi.com` to resolve connection failures.
- **Iframe Security**: Added `camera` to the iframe's allowed features, as required by the Tavus SDK for session initialization (even in Audio-Only mode).
- **Audio-Only Default**: Set `isAudioOnly` to `true` by default for a smoother voice-first experience.
- **Permission Sync**: Updated `metadata.json` to explicitly request camera permissions from the host environment.
- **Payload Stability**: Enhanced the client-side data parser to handle both snake_case and camelCase response keys from the Tavus API.
- **Persistent Diagnostics**: Ensured the System Diagnostics console remains active and visible during the full-screen transition to the live connection.
- **Usability Enhancement**: Added "Double-click to copy" functionality to all entries in the System Diagnostics console and removed text-selection restrictions.
- **Detailed Technical Logging**: Updated the "System Diagnostics" console to show granular technical steps (prefixed with tags like `SYS_INIT`, `HTTP_POST`, `DATA_PARSE`) for better visibility into the connection handshake.
- **Resilience Layer**: Implemented a 3-tier exponential backoff retry strategy in `App.tsx` to handle transient server errors.
- **Enhanced Logging**: The session log now correctly differentiates between "Provisioning" states and terminal errors.
- **Proxy Intelligence**: Added an `isTimeout` flag to the server response to signal to the client when a retry is appropriate.
- **Documentation**: Added `DISCUSSION.md` capturing the SME roundtable logic and `AGENTS.md` for persistent integration rules.

### Fixed
- **Timeout Criticality**: Resolved "timeout of 40000ms exceeded" by increasing the server-side proxy timeout to 100,000ms, accommodating Tavus replica provisioning times.
- **Indeterminate 500s**: Improved reliability by treating 500-level status codes as retryable events rather than terminal failures.
- **Error Object Parsing**: Fixed a bug where nested Tavus error objects were not being rendered correctly in the UI.

### Technical Notes
- Server: Express (Node.js)
- Timeout: 100s
- Retry Logic: Max 3 attempts with exponential backoff (Attempt * 1000ms).
