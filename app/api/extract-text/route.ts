import { NextRequest, NextResponse } from 'next/server';
// ...existing code...

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }

    const sql = (await import('@/lib/db')).default;
    const maxAttempts = 60;
    const delayMs = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await sql`SELECT text FROM Documents WHERE file_name = ${fileName} ORDER BY id DESC LIMIT 1`;
      if (result && result.length > 0) {
        return NextResponse.json({ text: result[0].text });
      }
      await wait(delayMs);
    }

    return NextResponse.json({ error: 'No extracted text found for this file' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
