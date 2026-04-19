import fs from 'fs';

const imagePath = 'C:/Users/sansk/.gemini/antigravity/brain/63cc50a9-84c5-44a3-b0d7-8c60e3892ee5/plant_leaf_test_1775944724013.png';

async function testAPI() {
  const formData = new FormData();
  const fileStats = fs.statSync(imagePath);
  const fileBlob = new Blob([fs.readFileSync(imagePath)]);
  formData.append('file', fileBlob, 'plant_leaf.png');

  try {
    const response = await fetch('https://rahul90k-pest-detection.hf.space/predict?strict=false', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Status:', response.status);
    const contentType = response.headers.get("content-type");
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log('JSON:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Text:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testAPI();
