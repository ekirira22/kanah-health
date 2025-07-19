"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"

type MessageType = "system" | "user" | "assistant" | "options"

interface Message {
  id: string
  type: MessageType
  content: string | string[]
}

export default function SymptomChecker() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content:
        "This tool helps you identify potential danger signs. If you're experiencing severe symptoms, please seek medical help immediately.",
    },
    {
      id: "2",
      type: "assistant",
      content: "Hello! I'm here to help check your symptoms. How are you feeling today?",
    },
    {
      id: "3",
      type: "options",
      content: ["Bleeding", "Pain", "Fever", "Breastfeeding"],
    },
  ])
  const [input, setInput] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Please tell me more about what you're experiencing.",
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: option,
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response based on option
    setTimeout(() => {
      let response = ""

      switch (option.toLowerCase()) {
        case "pain":
          response = "Please tell me more about what you're experiencing."
          break
        case "bleeding":
          response = "How heavy is the bleeding? Is it heavier than a normal period?"
          break
        case "fever":
          response = "What is your temperature? Do you have any other symptoms?"
          break
        case "breastfeeding":
          response = "Are you experiencing pain, difficulty with latching, or concerns about milk supply?"
          break
        default:
          response = "Can you tell me more about your symptoms?"
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader title="Symptom Checker" showBack />

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.type === "system" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">{message.content}</div>
            )}

            {message.type === "assistant" && (
              <div className="bg-secondary rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {message.type === "user" && (
              <div className="bg-primary text-white rounded-lg p-3 max-w-[80%] ml-auto">
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {message.type === "options" && (
              <div className="grid grid-cols-2 gap-2 my-4">
                {(message.content as string[]).map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="text-sm justify-start"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your symptoms..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
          />
          <Button size="icon" onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </main>
  )
}
