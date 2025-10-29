import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { convertToModelMessages, streamText, UIMessage } from 'ai'

export const maxDuration = 30

const bedrock = createAmazonBedrock({
  region: 'us-west-2',
  credentialProvider: fromNodeProviderChain(),
})

export async function POST(req: Request) {
  const {
    messages,
    model,
    reasoning,
  }: { messages: UIMessage[]; model: string; reasoning: string } =
    await req.json()

  const result = streamText({
    model: bedrock(model),
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
    providerOptions: {
      bedrock: {
        additionalModelRequestFields: {
          reasoning_effort: reasoning,
        },
      },
    },
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  })
}
