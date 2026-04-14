# Notification Preferences Center

Interactive mockup of a notification preferences UI with two tabs:

- **Personal Notifications** -- Email-only, per-user settings with mute controls
- **Account Notifications** -- Admin-managed settings with Email + Slack channel support

## Live Demo

https://chrisb-playground.vercel.app/notifications

## Local Development

```bash
cd notifications-pc/notifications
python3 -m http.server 8765
# Open http://localhost:8765
```

No build step required. The app uses React 18 + Babel standalone loaded from CDN for in-browser JSX transpilation.

## Project Structure

```
notifications-pc/
  SPEC.md                          # Detailed product spec
  README.md                        # This file
  notifications/
    index.html                     # Entry point, loads React/Babel CDN
    notification-center-mockup.js  # Single-file React component
```

## Deployment

Hosted on Vercel, auto-deploys from the `main` branch of `appcues/chrisb-playground` with root directory set to `notifications-pc`.
