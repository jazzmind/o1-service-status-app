Please help me build a server status tracking app in the latest version of NextJS using Tailwind CSS to make it look great. Help me by showing me how to code the main page, the visual components for the front end and api endpoints for the back end.

The backend of the app should consist of the following 3 api endpoints. Firebase credentials should be read from environment variables (set locally in a .env.local file and manually in the vercel settings for live deployment).

/api/check-services - is designed to be called every 5 minutes from AWS Event Bridge. Its job is to check a list of web services for their status and store this status in a firestore database. Here is an example server list:
{
    name: 'Global Login API',
    url: 'https://login-api.practera.com/stack',
    expectedResponse: {'message': 'Stack not found'},
    type: 'json'
},
{
    name: 'Global Login App',
    url: 'https://login.practera.com',
    expectedResponse: 200,
    type: 'http_status'
},
{
    name: 'USA Admin API',
    url: 'https://usa.practera.com/api/health?appkey=1234',
    expectedResponseKey: 'status',
    expectedResponseValue: 'success',
    type: 'json_key'
},
{
    name: 'USA Admin Web App',
    url: 'https://usa.practera.com/lti/providers/request',
    expectedResponseText: 'Missing consumer key',
    type: 'text'
}

/api/service-status is used to retrieve the current status of each service in the list from the database

/api/service-history is used to get historical statistics for each service. It should retrieve all the downtime records across a specified period of time. It should combine sequential downtime records into a single record with the combined duration.

The front end will use these api endpoints to create an interactive server status map. The main page should be a world map, styled like the map at NORAD in the Wargames movie. There should be clickable pulsing server icons located on London, West Virginia, Sydney and in the middle of the Atlantic Ocean (for global services). These should be red if the server is currently down, yellow if average response times are > 1 second, and green if all systems are good. The average 3/6/12 mo uptime statistics across all regions & global services should be displayed as well.

Clicking on a server icon should bring up a new screen that shows historical downtime events and average 3/6/12 mo uptime statistics for that region. 

Please also provide deployment instructions and also explain the folder structure layout. Think carefully about how we can make the app look as great as possible. Also, this app will be release as open source code, so let's make sure it follows best practice architecture for modern nextjs apps and that it is well documented.