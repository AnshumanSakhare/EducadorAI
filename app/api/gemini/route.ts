import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: NextRequest) {
  try {
    const { text, action, fileName } = await req.json();

    if (!text || !action) {
      return NextResponse.json({ error: 'Missing text or action' }, { status: 400 });
    }

    if (action === 'analyze') {
      if (fileName) {
        const sql = (await import('@/lib/db')).default;

        const existing = await sql`
          SELECT data FROM Analyses
          WHERE file_name = ${fileName}
          ORDER BY id DESC
          LIMIT 1
        `;
        if (existing && existing.length > 0) {
          return NextResponse.json(existing[0].data);
        }
      }

      const analysis = await getSummaryAndQnA(text);

      if (fileName) {
        const sql = (await import('@/lib/db')).default;
        await sql`
          INSERT INTO Analyses (file_name, data)
          VALUES (${fileName}, ${JSON.stringify(analysis)})
        `;
      }

      return NextResponse.json(analysis);
    }

    if (action === 'summarize') {
      const summary = await getSummary(text);
      return NextResponse.json({ summary });
    }

    if (action === 'qna') {
      const qna = await getQnA(text);
      return NextResponse.json({ qna });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('API key not valid')) {
      return NextResponse.json({ error: 'Invalid Gemini API key' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function generateText(prompt: string) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  const match = trimmed.match(/[\[{][\s\S]*[\]}]/);
  if (!match) {
    throw new Error('No JSON found in model response');
  }
  return JSON.parse(match[0]);
}

async function generateJsonSafe(prompt: string) {
  const text = await generateText(prompt);
  try {
    return { json: extractJson(text), rawText: text };
  } catch (error) {
    console.error('Failed to parse JSON from model response.', error);
    return { json: null, rawText: text };
  }
}

async function getSummary(text: string) {
  const prompt = [
    'You are an AI assistant for students.',
    'Return ONLY valid JSON with no code fences or extra text.',
    'Schema:',
    '{',
    '  "summary": string (3-5 concise sentences),',
    '  "highlights": string[] (3-6 bullet-style points),',
    '  "key_terms": [{"term": string, "definition": string}] (4-8 items)',
    '}',
    'Here is the content:',
    text,
  ].join('\n');
  const { json, rawText } = await generateJsonSafe(prompt);
  if (json) {
    return json;
  }
  return { summary: rawText.trim(), highlights: [], key_terms: [] };
}

async function getQnA(text: string) {
  const prompt = [
    'You are a helpful assistant that generates questions and answers from a text.',
    'Return ONLY valid JSON array with no code fences or extra text.',
    'Schema:',
    '[{"question": string, "answer": string}] (5-8 items)',
    'Here is the content:',
    text,
  ].join('\n');
  const { json, rawText } = await generateJsonSafe(prompt);
  if (json) {
    return json;
  }
  return rawText.trim();
}

async function getSummaryAndQnA(text: string) {
  const prompt = [
    'You are an AI assistant for students.',
    'Return ONLY valid JSON with no code fences or extra text.',
    'Schema:',
    '{',
    '  "summary": string (3-5 concise sentences),',
    '  "highlights": string[] (3-6 bullet-style points),',
    '  "key_terms": [{"term": string, "definition": string}] (4-8 items),',
    '  "qna": [{"question": string, "answer": string}] (5-8 items)',
    '}',
    'Here is the content:',
    text,
  ].join('\n');

  const { json, rawText } = await generateJsonSafe(prompt);
  if (json) {
    return json;
  }
  return {
    summary: rawText.trim(),
    highlights: [],
    key_terms: [],
    qna: [],
  };
}
