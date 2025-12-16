import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();
    const { fileName, fileType } = body;

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const fileServiceUrl = process.env.FILE_SERVICE_URL;

    const res = await fetch(`${fileServiceUrl}/file/presign-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `token=${token}`,
      },
      body: JSON.stringify({ fileName, fileType }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
    });
  }
}
