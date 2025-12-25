const axios = require("axios")

const BASE_URL = "https://p.savenow.to"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://y2down.cc/",
  Origin: "https://y2down.cc",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
  Pragma: "no-cache",
  "Cache-Control": "no-cache"
}

const AUDIO_FORMATS = [
  "mp3",
  "m4a",
  "webm",
  "aac",
  "flac",
  "opus",
  "ogg",
  "wav"
]

const VIDEO_FORMATS = [
  "4k",
  "1440",
  "1080",
  "720",
  "480",
  "320",
  "240",
  "144"
]

const SUPPORTED_FORMATS = [...AUDIO_FORMATS, ...VIDEO_FORMATS]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function requestDownload(url, format = "720") {
  if (!SUPPORTED_FORMATS.includes(format)) return null

  const params = {
    copyright: "0",
    format,
    url,
    api: "dfcb6d76f2f6a9894gjkege8a4ab232222"
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/ajax/download.php`,
      {
        params,
        headers: HEADERS,
        timeout: 30_000
      }
    )

    if (!data?.progress_url) return null

    return {
      progress_url: data.progress_url,
      title: data.info?.title || "YouTube Media",
      image: data.info?.image || null
    }
  } catch {
    return null
  }
}

async function checkProgress(
  progressUrl,
  maxAttempts = 60,
  delay = 2000
) {
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      const { data } = await axios.get(progressUrl, {
        headers: HEADERS,
        timeout: 30_000
      })

      if (data?.download_url)
        return { download_url: data.download_url }

      if (
        data?.error ||
        String(data?.text || "")
          .toLowerCase()
          .includes("error")
      )
        return null
    } catch {}

    attempt++
    await sleep(delay)
  }

  return null
}

async function youtube(url, format = "720") {
  try {
    if (!url)
      return {
        success: false,
        platform: "youtube",
        message: "URL YouTube tidak boleh kosong"
      }

    const progress = await requestDownload(url, format)
    if (!progress)
      return {
        success: false,
        platform: "youtube",
        message: "Gagal memulai download"
      }

    const result = await checkProgress(progress.progress_url)
    if (!result)
      return {
        success: false,
        platform: "youtube",
        message: "Gagal mendapatkan download url"
      }

    return {
      success: true,
      platform: "youtube",
      title: progress.title,
      image: progress.image,
      download_url: result.download_url
    }
  } catch (e) {
    return {
      success: false,
      platform: "youtube",
      message: "Terjadi kesalahan",
      error: e.message
    }
  }
}

module.exports = { youtube }
