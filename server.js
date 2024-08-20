const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const clientId = 'Ov23livSKzwtfBNCWRWh';
const clientSecret = '7151bd753c3a58765d3740017a8bc79a1a95cd0c';

let accessToken = '';

app.get('/auth/callback', async (req, resp) => {
    console.log('Server received response');
    //console.log('Server received response req', req);
    //console.log('Server received response resp', resp);
    //console.log('Server received req query:', req.query);
    
    // Log relevant parts of the response object
    //console.log('Response status code:', resp.statusCode);
    //console.log('Response headers:', resp.getHeaders());

    // Log the incoming request
    console.log('Request headers:', req.headers);
    console.log('Request query params:', req.query);

    const code = req.query.code;
    if(!code) {
        return resp.send('No code provided');
    }

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            },
            {
                headers: {Accept: 'application/json'},
            }
        );

        console.log('Token response data:', tokenResponse.data);  // Log the response data from GitHub

        accessToken = tokenResponse.data.access_token;
        // Here, you would normally fetch data using the accessToken
        // For now, we're just sending dummy data

        // Store tokens securely (e.g., in a database)
        // Set up a session or JWT for the user

        // Redirect to frontend after successful login
        resp.redirect('http://localhost:8080/merge-requests');
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        resp.send('Error exchanging code for token');
      }
});

// Endpoint to serve dummy merge requests data
app.get('/api/merge-requests/:type', async (req, res) => {
    const { type } = req.params;

    try {
        let response;
        const username = 'Bryan-WZ-Chen';

        // Bearer -> JWT
        if (type === 'assigned') {
          response = await axios.get(`https://api.github.com/search/issues?q=is:open+is:pr+assignee:${username}`, 
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        } else if (type === 'opened') {
          response = await axios.get(`https://api.github.com/search/issues?q=is:open+is:pr+author:${username}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        } else {
          return res.status(400).send('Invalid request type');
        }
        
        console.log('response -- get real data', res);
        // Send the data received from GitHub API to the frontend
        res.json(response.data.items); // GitHub API returns items array in the response
      } catch (error) {
        console.error('Error fetching data from GitHub:', error);
        res.status(500).send('Error fetching data from GitHub');
      }
  });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});