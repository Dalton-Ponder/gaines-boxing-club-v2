import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { form: formId, submissionData } = body

    if (!formId || !submissionData) {
      return NextResponse.json(
        { error: 'Missing form or submissionData' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Form submission error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
