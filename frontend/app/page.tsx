'use client'

import Chatbot from '@/components/Chatbot'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)


const AuthenticatedContent = () => {
  const [credentials, setCredentials] = useState<{
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }>()

  useEffect(() => {
    fetchAuthSession().then((session) => {
      if (session.credentials) {
        setCredentials({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken
        })
      }
    })
  }, [])

  if (!credentials) {
    return <div>Loading...</div>
  }

  return <Chatbot credentials={credentials}></Chatbot>
}
export default function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AuthenticatedContent></AuthenticatedContent>
      )}
    </Authenticator>
  );
}
