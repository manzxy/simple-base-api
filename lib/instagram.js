const axios = require("axios")

async function fetchIG(url) {
  const endpoint =
    "https://igram.website/content.php?url=" +
    encodeURIComponent(url)

  const { data } = await axios.post(endpoint, "", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10) Chrome/120 Mobile",
      "Referer": "https://igram.website/"
    }
  })

  return data
}

function parseIG(html) {
  html = html.replace(/\n|\t/g, "")

  const videos = [...html.matchAll(/<source src="([^"]+)/g)].map(v => v[1])
  let images = [...html.matchAll(/<img src="([^"]+)/g)].map(i => i[1])

  if (images.length) images = images.slice(1)

  const caption =
    html.match(/<p class="text-sm"[^>]*>(.*?)<\/p>/)?.[1]
      ?.replace(/<br ?\/?>/g, "\n") || ""

  const likes =
    html.match(/fa-heart"[^>]*><\/i>\s*([^<]+)/)?.[1] || null

  const comments =
    html.match(/fa-comment"[^>]*><\/i>\s*([^<]+)/)?.[1] || null

  const time =
    html.match(/fa-clock"[^>]*><\/i>\s*([^<]+)/)?.[1] || null

  return {
    type: videos.length ? "video" : "image",
    video: videos[0] || null,
    images: videos.length ? [] : images,
    caption,
    likes,
    comments,
    time
  }
}

async function instagram(url) {
  try {
    if (!url) throw new Error("URL Instagram tidak boleh kosong")

    const raw = await fetchIG(url)
    if (!raw?.html) throw new Error("Gagal scrape Instagram")

    const parsed = parseIG(raw.html)

    return {
      success: true,
      platform: "instagram",
      username: raw.username || null,
      type: parsed.type,
      caption: parsed.caption,
      stats: {
        likes: parsed.likes,
        comments: parsed.comments
      },
      time: parsed.time,
      media: {
        video: parsed.video,
        images: parsed.images
      }
    }
  } catch (e) {
    return {
      success: false,
      platform: "instagram",
      message: "Gagal mengambil data Instagram",
      error: e.message
    }
  }
}

module.exports = { instagram }
