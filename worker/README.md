# Natural Japanese voice — Azure Speech proxy (free)

This tiny Cloudflare Worker lets the app use Azure's **neural** Japanese voices
(Nanami, Keita…) for free. Your Azure key stays on the Worker, never in the app.

Azure free tier (**F0**) gives **500,000 characters/month** of neural TTS — far
more than this app will ever use.

## 1. Get an Azure Speech key (free)
1. Create a free Azure account: https://azure.microsoft.com/free
2. In the portal → **Create resource** → search **Speech** → Create.
   - Pricing tier: **Free F0**.
   - Pick a **Region** (remember it, e.g. `southeastasia`, `japaneast`, `eastus`).
3. Open the resource → **Keys and Endpoint** → copy **KEY 1** and the **Region**.

## 2. Deploy the Worker (free)
Install the Cloudflare CLI and deploy from this folder:

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler deploy
wrangler secret put AZURE_KEY       # paste KEY 1
wrangler secret put AZURE_REGION    # paste the region, e.g. southeastasia
```

`wrangler deploy` prints a URL like:
`https://japanese-learner-tts.<you>.workers.dev`

Test it in a browser:
`https://japanese-learner-tts.<you>.workers.dev/?text=よんひゃくえん`
→ should play/download an MP3.

## 3. Connect the app
In the app → **⚙ Settings → Natural voice (Azure)**:
- Turn **on**, paste the Worker URL, pick a voice (Nanami/Keita…), tap **Test**.

If the Worker is unreachable, the app automatically falls back to the device's
built-in voice, so nothing breaks offline.

## Notes
- Japanese neural voices: `ja-JP-NanamiNeural`, `ja-JP-KeitaNeural`,
  `ja-JP-AoiNeural`, `ja-JP-DaichiNeural`, `ja-JP-MayuNeural`,
  `ja-JP-NaokiNeural`, `ja-JP-ShioriNeural`.
- Responses are cached (1 week) by the Worker and in the app, so repeats don't
  spend quota.
