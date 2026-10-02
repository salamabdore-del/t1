const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    console.log('Groq API Response:', JSON.stringify(data));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      // إظهار سبب الخطأ القادم من Groq مباشرة
      const errorMsg = data.error?.message || 'استجابة غير متوقعة من Groq';
      res.json({ reply: `خطأ من Groq: ${errorMsg}` });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'خطأ في الاتصال بالسيرفر' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
