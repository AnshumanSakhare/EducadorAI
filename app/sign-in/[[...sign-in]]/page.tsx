import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <section className="flex justify-center items-center lg:min-h-[45vh]">
      <SignIn />
    </section>
  );
}
