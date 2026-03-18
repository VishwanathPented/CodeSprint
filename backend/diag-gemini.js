import dotenv from 'dotenv';
dotenv.config();

const testAccess = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('--- RAW API TEST ---');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log('Available Models List:');
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log('No models returned in list. Response:', JSON.stringify(data));
    }
  } catch (err) {
    console.log('Raw Fetch Error:', err.message);
  }
};

testAccess();
