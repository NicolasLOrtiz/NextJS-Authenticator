import {FormEvent, useState} from 'react'
import {useAuth} from '../hooks/useAuth';
import styles from '../styles/Home.module.css'
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import {withSSRGuest} from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { signIn } = useAuth();

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const data = {
      email,
      password,
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Enter</button>
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = withSSRGuest<{}>( async (ctx: GetServerSidePropsContext) => {
    return {
        props: {}
    }
})
