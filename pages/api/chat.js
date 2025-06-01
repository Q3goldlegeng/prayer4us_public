export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req, res) {
  try {
    const { model, messages, max_tokens, temperature, voice, input, response_format } = req.body;

    const isTTS = model === 'tts-1';

    const response = await fetch(`https://api.openai.com/v1/${isTTS ? 'audio/speech' : 'chat/completions'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(
        isTTS
          ? { model, voice, input, response_format }
          : { model, messages, max_tokens, temperature }
      )
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    if (isTTS) {
      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(Buffer.from(audioBuffer));
    } else {
      const data = await response.json();
      return res.status(200).json(data);
    }

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
}
