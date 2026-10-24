import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const role = typeof params.role === "string" ? params.role : "user";
  const email = typeof params.email === "string" ? params.email : "";

  const query = new URLSearchParams({
    tab: "signup",
    role,
    ...(email ? { email } : {}),
  });

  redirect(`/auth/signin?${query.toString()}`);
}
