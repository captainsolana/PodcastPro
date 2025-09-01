// Test API request directly
async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    const response = await fetch('http://localhost:3001/api/projects?userId=single-user');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Projects found:', data.length);
      console.log('Projects:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testAPI();
