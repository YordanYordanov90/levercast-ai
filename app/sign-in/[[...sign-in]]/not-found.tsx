import { redirect } from 'next/navigation'

export default function SignInNotFound() {
  redirect('/sign-in')
}