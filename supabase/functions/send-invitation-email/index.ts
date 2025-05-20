
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, accessCode, formTitle } = await req.json()
    
    console.log('Sending invitation email to:', email, 'with access code:', accessCode, 'for form:', formTitle)

    // Get Supabase URL for calling our other edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Call our send-raw-email function which now uses Resend
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-raw-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: `Invitation to Bin Tally Form: ${formTitle}`,
        html: `
          <h1>You've been invited to complete a bin tally form</h1>
          <p>You have been invited to access the form: <strong>${formTitle}</strong></p>
          <p>You can access the form using this code: <strong>${accessCode}</strong></p>
          <p>Visit the website and enter this code to begin.</p>
          <p>Thank you!</p>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error('Failed to send email:', errorData)
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`)
    }

    const emailData = await emailResponse.json()
    console.log('Email API response:', emailData)

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
