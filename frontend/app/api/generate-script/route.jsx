import { generateScript } from "@/configs/AiModel";
import { NextResponse } from "next/server";

const SCRIPT_PROMPT = `write a two different script for 30 seconds video on Topic:{topic} for Audience:{audience} with Purpose:{purpose},
Do not add Scene description
Do not Add Anything in Braces, just return the plain story in text
Give me response in JSON format and follow the schema
-{
scripts:[
{
content:''
},
],
}`;

export async function POST(req) {
  const body = await req.json(); // 
  const { topic, audience, purpose } = body;

  const prompt = SCRIPT_PROMPT
    .replace("{topic}", topic)
    .replace("{audience}", audience)
    .replace("{purpose}", purpose);

  try {
    const result = await generateScript.sendMessage(prompt);
    const resp = result?.response?.text();
    return NextResponse.json(JSON.parse(resp));
  } catch (error) {
    console.error("Error generating script:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
