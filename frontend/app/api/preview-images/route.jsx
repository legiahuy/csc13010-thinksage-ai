import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";

export async function POST(req) {
    try {
        console.log('Received preview-images request');
        const formData = await req.json();
        console.log('Request data:', formData);

        if (!formData.script || !formData.videoStyle || !formData.recordId) {
            console.error('Missing required fields:', {
                hasScript: !!formData.script,
                hasVideoStyle: !!formData.videoStyle,
                hasRecordId: !!formData.recordId
            });
            return NextResponse.json(
                { error: 'Missing required fields: script, videoStyle, and recordId are required' },
                { status: 400 }
            );
        }

        const result = await inngest.send({
            name: 'preview-images',
            data: {
                ...formData
            }
        });
        console.log('Inngest response:', result);
        return NextResponse.json({ result: result });
    } catch (error) {
        console.error('Error in preview-images route:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}