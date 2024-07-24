import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { useSession, signIn, signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function Header() {
    const router = useRouter()

    const { data: session, status } = useSession()

    return (
        <header className="w-full h-20 flex items-center justify-center shadow-xl">
            <section className="px-4 w-full flex justify-between items-center max-w-7xl">
                <nav className="flex items-center gap-8">
                    <Link href="/">
                        <h1 className="text-3xl font-bold pl-1 select-none">Tarefas<span className="text-red-500">+</span></h1>
                    </Link>

                    {session?.user && <Button onClick={() => router.push('/dashboard')} variant="secondary" className="">Meu painel</Button>}
                </nav>

                <div className="flex gap-4">
                    {status === "loading" ? (
                        <div className="border border-primary rounded-full size-6 my-auto border-t-0 animate-spin" />
                    ) : session ? (
                        <div className="flex items-center justify-center gap-2">
                            <div>
                                <h1 className="text-xl font-bold">{session.user?.name}</h1>
                            </div>
                            <Button onClick={() => signOut()} variant="destructive"><LogOut /></Button>
                        </div>
                    ) : (
                        <Button onClick={() => signIn("google")} variant="outline">Acessar</Button>
                    )}
                </div>
            </section>
        </header>
    )
}