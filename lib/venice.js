const axios = require("axios")
const { v4: uuidv4 } = require("uuid")

const BASE_URL = "https://outerface.venice.ai/api/inference/chat"
const AGENT =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"

function getVersion() {
  const d = new Date()
  const dateStr = `${d.getFullYear()}${String(
    d.getMonth() + 1
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `interface@${dateStr}.230844+7989322`
}

function genId() {
  return uuidv4().replace(/-/g, "").slice(0, 12)
}

async function venice(prompt, model = "dolphin-3.0-mistral-24b") {
  try {
    if (!prompt)
      return {
        success: false,
        message: "Missing prompt"
      }

    const payload = {
      requestId: genId(),
      conversationType: "text",
      type: "text",
      modelId: model,
      modelName: "Venice Uncensored",
      modelType: "text",
      prompt: [{ content: prompt, role: "user" }],
      systemPrompt: "",
      messageId: genId(),
      includeVeniceSystemPrompt: true,
      isCharacter: false,
      userId: `user_anon_${Math.floor(Math.random() * 1e9)}`,
      simpleMode: false,
      webEnabled: true,
      reasoning: true
    }

    const { data } = await axios.post(BASE_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Venice-Version": getVersion(),
        "User-Agent": AGENT,
        Referer: "https://venice.ai/"
      }
    })

    const lines = String(data)
      .split("\n")
      .filter(Boolean)

    let text = ""
    let references = []

    for (const line of lines) {
      try {
        const j = JSON.parse(line)
        if (j.kind === "content" && j.content) {
          text += j.content
        } else if (j.kind === "meta" && j.references) {
          references = j.references
        }
      } catch {}
    }

    return {
      success: true,
      creator: "manzxy",
      model,
      result: text || "No response generated.",
      references
    }
  } catch (e) {
    return {
      success: false,
      creator: "manzxy",
      message: "Failed to fetch response",
      error: e.message
    }
  }
}

module.exports = { venice }
