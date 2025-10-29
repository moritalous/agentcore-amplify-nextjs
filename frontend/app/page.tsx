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
  const [token, setToken] = useState('')

  useEffect(() => {
    fetchAuthSession().then((session) => {
      const accessToken = session.tokens?.accessToken?.toString() || ''
      setToken(accessToken)
    })
  }, [])

  if (!token) {
    return <div>Loading...</div>
  }

  return <Chatbot token={token}></Chatbot>
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
