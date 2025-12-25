const axios = require("axios")

async function lyrics(title) {
  try {
    if (!title)
      return {
        success: false,
        message: "Missing song title"
      }

    const { data } = await axios.get(
      "https://lrclib.net/api/search",
      {
        params: { q: title },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
        }
      }
    )

    if (!data || !data[0])
      return {
        success: false,
        message: "Lyrics not found"
      }

    const song = data[0]
    const lyricsRaw = song.plainLyrics || song.syncedLyrics

    if (!lyricsRaw)
      return {
        success: false,
        message: "Lyrics not available"
      }

    const cleanLyrics = lyricsRaw
      .replace(/\[.*?\]/g, "")
      .trim()

    return {
      success: true,
      result: {
        title: song.trackName || null,
        artist: song.artistName || null,
        album: song.albumName || null,
        duration: song.duration
          ? `${Math.floor(song.duration / 60)}:${String(
              song.duration % 60
            ).padStart(2, "0")}`
          : "Unknown",
        lyrics: cleanLyrics
      }
    }
  } catch (e) {
    return {
      success: false,
      message: "Failed to fetch lyrics",
      error: e.message
    }
  }
}

module.exports = { lyrics }
