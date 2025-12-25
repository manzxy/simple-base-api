const axios = require("axios")

async function instagram(url) {
  try {
    const endpoint =
      "https://igram.website/content.php?url=" +
      encodeURIComponent(url)

    const response = await axios.post(endpoint, "", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
        "Referer": "https://igram.website/",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest"
      }
    })

    if (!response.data?.html) {
      return {
        success: false,
        message: "Gagal mengambil data Instagram"
      }
    }

    const html = response.data.html.replace(/\n|\t/g, "")

    const video =
      html.match(/<source src="([^"]+)/)?.[1] || null

    let image =
      html.match(/<img src="([^"]+)/)?.[1] || null

    const downloadUrl = video || image

    if (!downloadUrl) {
      return {
        success: false,
        message: "Media tidak ditemukan"
      }
    }

    return {
      success: true,
      download_url: downloadUrl
    }
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan dalam mengambil data.",
      error: error.response
        ? error.response.data
        : error.message
    }
  }
}

module.exports = { instagram }
