const url = "https://pdey9yma.us-east.insforge.app/rest/v1";
const anonKey = "anon_897abc3685c27a2e113b8022caaf12a8dc8233b25aa9ce5397c83ffa88362804";

async function testRest() {
  try {
    const res = await fetch(`${url}/users?select=*`, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json"
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text.slice(0, 300));
  } catch (err) {
    console.error("Error:", err);
  }
}

testRest();
