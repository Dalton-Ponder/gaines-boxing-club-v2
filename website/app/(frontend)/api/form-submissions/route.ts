import { NextResponse } from 'next/server'

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

    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
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
