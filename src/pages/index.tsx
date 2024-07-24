import Image from "next/image";
import { Roboto } from "next/font/google";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase-connection";

const roboto = Roboto({ subsets: ["latin"], weight: "400" });

interface HomeProps {
  numberOfPosts: number
  numberOfComments: number
}

export default function Home({ numberOfPosts, numberOfComments }: HomeProps) {
  return (
    <main
      className={`h-custom flex flex-col items-center justify-center ${roboto.className}`}
    >
      <Head>
        <title>Tarefas+</title>
      </Head>
      <div className="flex flex-col items-center justify-center">
        <Image
          alt="Logo Tarefas+"
          src="/hero.png"
          priority
          width={384}
          height={100}
          className="max-w-96 object-contain h-auto"
        />

        <h1 className="text-center m-7 leading-relaxed text-2xl font-bold">
          Sistema feito para você organizar <br /> seus estudos e terefas
        </h1>

        <div className="flex items-center w-full gap-8 flex-col sm:flex-row">
          <Button className="w-full" size="lg">+{numberOfPosts} posts</Button>
          <Button className="w-full" size="lg">+{numberOfComments} comentários</Button>
        </div>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentsRef = collection(db, "comments");
  const postsRef = collection(db, "tasks");

  const commentSnapshot = await getDocs(commentsRef);
  const postsSnapshot = await getDocs(postsRef);

  const numberOfComments = commentSnapshot.size;
  const numberOfPosts = postsSnapshot.size;

  return {
    props: {
      numberOfPosts,
      numberOfComments,
    },
    revalidate: 60,
  };
};