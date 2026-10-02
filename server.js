const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.json({ reply: 'خطأ: مفتاح GROQ_API_KEY غير موجود في متغيرات البيئة على Render.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي ومفيد وتجيب دائماً باللغة العربية بأسلوب واضح ومباشر.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ reply: data.choices[0].message.content });
    } else {
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
