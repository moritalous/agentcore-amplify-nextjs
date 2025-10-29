'use client'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { Response } from '@/components/ai-elements/response'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources'
import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  HttpChatTransportInitOptions,
  UIMessage,
} from 'ai'
import { Fragment, useState } from 'react'

const models = [
  {
    name: 'gpt-oss:120b',
    value: 'openai.gpt-oss-120b-1:0',
  },
  {
    name: 'gpt-oss:20b',
    value: 'openai.gpt-oss-20b-1:0',
  },
]
const reasonings = [
  {
    name: 'low',
    value: 'low',
  },
  {
    name: 'medium',
    value: 'medium',
  },
  {
    name: 'high',
    value: 'high',
  },
]

function buildApiUrl() {
  if (process.env.NEXT_PUBLIC_AGENT_ARN) {
    const agentArn = process.env.NEXT_PUBLIC_AGENT_ARN!
    const region = process.env.NEXT_PUBLIC_AWS_REGION!
    const escapedArn = encodeURIComponent(agentArn)
    const qualifier = process.env.NEXT_PUBLIC_QUALIFIER
    return `https://bedrock-agentcore.${region}.amazonaws.com/runtimes/${escapedArn}/invocations?qualifier=${qualifier}`
  } else {
    return 'http://localhost:8080/invocations'
  }
}

const ChatBot = ({ token }: { token: string }) => {
  const [input, setInput] = useState('')
  const [model, setModel] = useState<string>(models[0].value)
  const [reasoning, setReasonings] = useState(reasonings[1].value)

  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36)}`);

  const transportOptions: HttpChatTransportInitOptions<UIMessage> = {
    api: buildApiUrl(),
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Amzn-Trace-Id': `trace-${Date.now()}`,
      'Content-Type': 'application/json',
      'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': sessionId,
    },
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport(transportOptions),
  })

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text) {
      sendMessage(
        {
          text: message.text,
          files: message.files,
        },
        {
          body: {
            model: model,
            reasoning: reasoning,
          },
        },
      )
      setInput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' &&
                  message.parts.filter((part) => part.type === 'source-url')
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === 'source-url',
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === 'source-url')
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                        </Fragment>
                      )
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === 'streaming' &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value)
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setReasonings(value)
                }}
                value={reasoning}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {reasonings.map((reasonin) => (
                    <PromptInputModelSelectItem
                      key={reasonin.value}
                      value={reasonin.value}
                    >
                      {reasonin.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

export default ChatBot
