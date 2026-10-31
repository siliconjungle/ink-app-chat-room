# Chat Room

Chat with ordered messages, immediate pending sends, paginated history and retry-safe delivery.

## Install

Requires a running [Ink OS](https://github.com/siliconjungle/ink-os-platform) instance and its `ink-os` CLI. Use Node.js 24 or later for development.

```sh
git clone https://github.com/siliconjungle/ink-app-chat-room.git
cd ink-app-chat-room
npm test
# Select your Ink instance using its CLI connection profile.
ink-os deploy .
```

The CLI deploys committed source from your checkout. Commit any edits before deploying them. No credentials or personal instance configuration belong in this repository.

## Behaviour and limits

Display names are editable nicknames. Access follows the Ink instance account permissions.

## License

MIT for app code. Bundled third-party components retain their own licenses and notices.
