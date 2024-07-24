import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/services/firebase-connection"
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { Trash } from "lucide-react"

import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import { FormEvent, useState } from "react"

interface TaskProps {
    task: {
        taskId: string
        created: Date
        is_public: boolean
        title: string
        description: string
        user: string
    },
    allComments: CommentProps[]
}

interface CommentProps {
    id: string
    comment: string
    user: string
    name: string
    taskId: string
}


export default function Task({ task, allComments }: TaskProps) {
    const { data: session } = useSession()
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    async function handleComment(e: FormEvent) {
        e.preventDefault()

        if (comment === "") return

        if (!session?.user?.email || !session.user.name) return

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment,
                created: new Date(),
                user: session.user.email,
                name: session.user.name,
                taskId: task.taskId
            })

            const data = {
                id: docRef.id,
                comment,
                user: session.user.email,
                name: session.user.name,
                taskId: task.taskId
            }

            setComments((oldItems) => [...oldItems, data])
            setComment("")
        } catch (error) {
            console.log(error)
        }

    }

    async function handleDeletComment(id: string) {
        try {
            const docRef = doc(db, "comments", id)

            await deleteDoc(docRef)

            const deletComment = comments.filter((item) => item.id !== id)
            setComments(deletComment)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-5 flex flex-col justify-center items-center gap-4 py-10">
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className="w-full">
                <Card>
                    <CardHeader className="border-b flex jus">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <CardTitle>{task.title}</CardTitle>
                                <CardDescription className="whitespace-pre-wrap">{task.description}</CardDescription>
                                <Badge>Publico</Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </main>

            <section className="w-full gap-4">

                <form onSubmit={handleComment} className="w-full flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="comment">Deixar comentário</Label>
                        <Textarea
                            id="comment"
                            placeholder="Deixe seu comentário"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>
                    <Button disabled={!session?.user} type="submit">Enviar Comentario</Button>
                </form>
            </section>

            <section className="w-full gap-4">
                <h2 className="text-3xl font-bold">Todos comentarios</h2>
                {comments.length === 0 && (
                    <h2 className="text-xl text-center font-bold">Nenhum Comentário...</h2>
                )}
                <div className="w-full space-y-2">
                    {comments.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="border-b flex">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2 w-full">
                                        <div className="flex justify-between py-2">
                                            <div>
                                                <CardTitle>{item.name}</CardTitle>
                                                <Badge>{item.user}</Badge>
                                            </div>
                                            {item.user === session?.user?.email && (
                                                <Button onClick={() => handleDeletComment(item.id)} variant="destructive">
                                                    <Trash />
                                                </Button>
                                            )}
                                        </div>
                                        <CardDescription className="whitespace-pre-wrap">{item.comment}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string

    const docRef = doc(db, "tasks", id)

    const queryRef = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(queryRef)

    const allComments: CommentProps[] = []
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            name: doc.data().name,
            taskId: doc.data().taskId,
            user: doc.data().user,
        })
    })

    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    if (!snapshot.data()?.is_public) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000

    const task = {
        created: new Date(miliseconds).toLocaleDateString(),
        is_public: snapshot.data()?.is_public,
        title: snapshot.data()?.title,
        user: snapshot.data()?.user,
        description: snapshot.data()?.description,
        taskId: id
    }

    return {
        props: {
            task,
            allComments
        }
    }
}