const https = require("https")

const MODELS = [
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4o-mini",
  "claude",
  "gemini",
  "deepseek"
]

function chatJadve(text, model = "gpt-5-nano") {
  return new Promise((resolve) => {
    if (!text)
      return resolve({
        success: false,
        message: "Teks kosong"
      })

    if (!MODELS.includes(model))
      return resolve({
        success: false,
        message: "Model tidak valid",
        models: MODELS
      })

    const body = JSON.stringify({
      id: Math.random().toString(36).slice(2),
      messages: [
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text:
                "Jawab santai, jelas, detail dan semenarik mungkin."
            }
          ]
        },
        {
          role: "user",
          content: [{ type: "text", text }]
        }
      ],
      model,
      stream: true
    })

    const req = https.request(
      {
        hostname: "ai-api.jadve.com",
        path: "/api/chat",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "Mozilla/5.0",
          Referer: "https://jadve.com"
        }
      },
      res => {
        let buf = ""
        let out = ""

        res.on("data", d => {
          buf += d.toString()
          const lines = buf.split("\n")
          for (const l of lines.slice(0, -1)) {
            if (l.startsWith("0:")) {
              out += JSON.parse(l.slice(2))
            }
          }
          buf = lines.at(-1)
        })

        res.on("end", () =>
          resolve({
            success: true,
            creator: "manzxy",
            model,
            result: out.trim()
          })
        )
      }
    )

    req.on("error", err =>
      resolve({
        success: false,
        creator: "manzxy",
        message: "Request gagal",
        error: err.message
      })
    )

    req.write(body)
    req.end()
  })
}

module.exports = { chatJadve, MODELS }
