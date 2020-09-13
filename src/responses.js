const fs = require('fs');

// the client.html file
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
// the style.css file
const style = fs.readFileSync(`${__dirname}/../client/style.css`);


const respond = (request, response, status, content, contentType) => {
  response.writeHead(status, { 'Content-Type': contentType });
  response.write(content);
  response.end();
};

//function to create the response json object based on the status and return it.
const createJSON = (status) => {
  const json = {};

  switch (status) {
    case '200':
      json.message = 'This is a succesful response.';
      break;
    case '400':
      json.message = 'Missing valid query parameter set to true.';
      json.id = 'badRequest';
      break;
    case '401':
      json.message = 'Missing loggedIn query parameter set to yes.';
      json.id = 'unauthorized';
      break;
    case '403':
      json.message = 'User is forbidden from accessing this content.';
      json.id = 'forbidden';
      break;
    case '500':
      json.message = 'Oops. Internal Server Error.';
      json.id = 'internalError';
      break;
    case '501':
      json.message = 'A GET request was not implemented for this page.';
      json.id = 'notImplemented';
      break;
    case '404':
      json.message = 'The page requested was not found.';
      json.id = 'notFound';
      break;
    default:
      json.message = 'The page requested was not found.';
      json.id = 'notFound';
      break;
  }

  return json;
};

//create the response content, if the accepted type from the server is xml, generate xml 
//and return that, else return json
const createContent = (acceptedTypes, status) => {
  const content = createJSON(status);

  if (acceptedTypes[0] === 'text/xml') {
    let xmlContent = `<response><message>${content.message}</message>`;
    if (content.id) {
      xmlContent = `${xmlContent}<id>${content.id}</id>`;
    }
    xmlContent = `${xmlContent}</response>`;
    return xmlContent;
  }

  return JSON.stringify(content);
};

// load and server client.html
const getIndex = (request, response) => respond(request, response, 200, index, 'text/html');

// load and serve style.css
const getStyle = (request, response) => respond(request, response, 200, style, 'text/css');

//return a success request
const success = (request, response, acceptedTypes) => {
  const content = createContent(acceptedTypes, '200');
  return respond(request, response, '200', content, acceptedTypes[0]);
};

//respond to a bad request
const badRequest = (request, response, acceptedTypes, params) => {
  if (!params.valid || params.valid !== 'true') {
    const content = createContent(acceptedTypes, '400');
    return respond(request, response, '400', content, acceptedTypes[0]);
  }

  const content = createContent(acceptedTypes, '200');
  content.message = 'This request has a correct valid parameter.';
  return respond(request, response, '200', content, acceptedTypes[0]);
};

//respond to an unauthorized request
const unauthorized = (request, response, acceptedTypes, params) => {
  if (!params.loggedIn || params.loggedIn !== 'yes') {
    const content = createContent(acceptedTypes, '401');
    return respond(request, response, '401', content, acceptedTypes[0]);
  }

  const content = createContent(acceptedTypes, '200');
  content.message = 'User is logged in and can view this content.';
  return respond(request, response, '200', content, acceptedTypes[0]);
};

//respond to a forbidden request.
const forbidden = (request, response, acceptedTypes) => {
  const content = createContent(acceptedTypes, '403');
  return respond(request, response, '403', content, acceptedTypes[0]);
};

//respond to a internal server error request
const internal = (request, response, acceptedTypes) => {
  const content = createContent(acceptedTypes, '500');
  return respond(request, response, '500', content, acceptedTypes[0]);
};

//respond to a content not implemented request
const notImplemented = (request, response, acceptedTypes) => {
  const content = createContent(acceptedTypes, '501');
  return respond(request, response, '501', content, acceptedTypes[0]);
};

//respond to a page not found request
const notFound = (request, response, acceptedTypes) => {
  const content = createContent(acceptedTypes, '404');
  return respond(request, response, '404', content, acceptedTypes[0]);
};

//export the response functions
module.exports = {
  getIndex,
  getStyle,
  success,
  badRequest,
  unauthorized,
  forbidden,
  internal,
  notImplemented,
  notFound,

};
