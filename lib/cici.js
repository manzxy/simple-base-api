const axios = require("axios")
const { randomUUID } = require("crypto")

async function ciciAI(question) {
  try {
    if (!question)
      return {
        success: false,
        creator: "manzxy",
        message: "Teks kosong"
      }

    const { data } = await axios.post(
      "https://api-normal-i18n.ciciai.com/im/sse/send/message",
      {
        channel: 3,
        cmd: 100,
        sequence_id: randomUUID(),
        uplink_body: {
          send_message_body: {
            bot_id: "7241547611541340167",
            bot_type: 1,
            content: JSON.stringify({ text: question }),
            content_type: 1,
            conversation_id: "485805516280081",
            conversation_type: 3,
            create_time: Math.floor(Date.now() / 1000),
            local_message_id: randomUUID()
          }
        },
        version: "1"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      }
    )

    const res = []
    const regex = /"origin_content"\s*:\s*"([^"]*)"/g
    let m

    while ((m = regex.exec(data)) !== null) {
      res.push(m[1])
    }

    if (!res.length)
      return {
        success: false,
        creator: "manzxy",
        message: "Tidak ada jawaban"
      }

    return {
      success: true,
      creator: "manzxy",
      result: res.join("")
    }
  } catch (e) {
    return {
      success: false,
      creator: "manzxy",
      message: "Terjadi kesalahan",
      error: e.message
    }
  }
}

module.exports = { ciciAI }
