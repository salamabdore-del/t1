const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// مسار اختبار بسيط للتأكد أن السيرفر يعمل
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chatbot backend is running ✅' });
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.json({ reply: 'خطأ: مفتاح GROQ_API_KEY غير موجود في متغيرات البيئة على Render.' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: 'خطأ: لم يتم إرسال نص الرسالة.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // ✅ النموذج المحدّث بدلاً من mixtral-8x7b-32768 المُوقَف
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي ومفيد وتجيب دائماً باللغة العربية بأسلوب واضح ومباشر.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({ reply: data.choices[0].message.content });
    }

    const errorMsg = data.error?.message || 'استجابة غير متوقعة من Groq';
    return res.json({ reply: `خطأ من Groq: ${errorMsg}` });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'خطأ في الاتصال بالسيرفر' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
