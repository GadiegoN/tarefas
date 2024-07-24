import { GetServerSideProps } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react"
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { Share2, Trash } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/services/firebase-connection";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface UserProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string
    created: Date
    is_public: boolean
    title: string
    description: string
    user: string
}

export default function Dashboard({ user }: UserProps) {
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isPublickTask, setIsPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTasks() {
            const tasksRef = collection(db, "tasks")
            const queryRef = query(
                tasksRef,
                orderBy("created", "desc"),
                where("user", "==", user.email)
            )

            onSnapshot(queryRef, (snapshot) => {
                const listTasks = [] as TaskProps[]

                snapshot.forEach((doc) => {
                    listTasks.push({
                        id: doc.id,
                        created: doc.data().created,
                        is_public: doc.data().is_public,
                        title: doc.data().title,
                        user: doc.data().user,
                        description: doc.data().description
                    })
                })

                setTasks(listTasks)
            })
        }

        loadTasks()
    }, [user.email])

    async function handleRegisterTask(e: FormEvent) {
        e.preventDefault()

        if (title === "") {
            return
        }

        try {
            await addDoc(collection(db, "tasks"), {
                title: title,
                description: description,
                created: new Date(),
                user: user.email,
                is_public: isPublickTask
            })

            setTitle("")
            setDescription("")
            setIsPublicTask(false)

        } catch (error) {
            console.log(error)
        }

    }

    function handleNavigationTask(id: string) {
        router.push(`/dashboard/task/${id}`)
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/dashboard/task/${id}`)
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tasks", id)

        await deleteDoc(docRef)
    }

    return (
        <div className="h-custom flex flex-col w-11/12 mx-auto">
            <Head>
                <title>Painel de Tarefas</title>
            </Head>

            <div className="w-full max-w-7xl sm:px-5 mx-auto">
                <section>
                    <div>
                        <form onSubmit={handleRegisterTask} className="space-y-4 py-6">
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold text-xl" htmlFor="title">Qual sua tarefa?</Label>
                                <Input
                                    id="title"
                                    placeholder="Escreva o titulo da sua tarefa..."
                                    value={title}
                                    required
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold" htmlFor="description">Qual descrição da sua tarefa?</Label>
                                <Textarea
                                    required
                                    id="description"
                                    placeholder="Escreva sua tarefa..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="isPublic" checked={isPublickTask} onCheckedChange={(checked) => setIsPublicTask(!!checked)} />
                                <Label htmlFor="isPublic">Deixar tarefa publica</Label>
                            </div>

                            <Button className="w-full" type="submit">Registrar</Button>
                        </form>
                    </div>
                </section>

                <section className="flex flex-col gap-4 pb-10">
                    <h1 className="text-xl font-bold text-center">Minhas tarefas</h1>

                    {tasks && tasks.map((task) => (
                        <Card key={task.id}>
                            <CardHeader className="border-b flex jus">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <CardTitle>{task.title}</CardTitle>
                                        {task.is_public && <Badge>Publico</Badge>}
                                    </div>
                                    {task.is_public && (
                                        <div className="flex gap-2 items-center">
                                            <Button variant="outline" onClick={() => handleNavigationTask(task.id)}>Ver</Button>
                                            <Button size="icon" variant="outline" onClick={() => handleShare(task.id)}><Share2 /></Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="line-clamp-3 whitespace-pre-wrap text-justify">{task.description}</CardDescription>
                                <div className="w-full flex flex-col items-end mt-4 gap-4">
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteTask(task.id)}><Trash /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    return {
        props: {
            user: {
                email: session.user.email
            }
        }
    }
}