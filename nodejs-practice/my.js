const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

const createBtn = `<a href="/create">Create</a>`;
function updateBtn(title) {
  return `<a href="/update?id=${title}">Update</a>`;
}
function writingForm(feature, titleValue, description) {
  return `<form action="/${feature}_process" method="post">
  <p><input type="hidden" name="id" value="${titleValue}"/></p>
  <p><input type="text" name="title" placeholder="title" value="${titleValue}"/></p>
  <p><textarea name="description" placeholder="description" cols="30" rows="10">${description}</textarea></p>
  <p><input type="submit" value="submit" /></p>
  </form>`;
}

const DATA_DIR = './data';
const WELCOME_TITLE = 'Welcome๐';
const WELCOME_CONTENT = 'Welcome to Node.js๐';

// HTML์์ ๋ฐ๋ณต๋๋ ๋งํฌ์์ ํํ๋ฆฟ ํจ์๋ก ์์ฑ
function templateHTML(title, list, body, control) {
  return `<!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
     ${list}
     ${control}
     ${body}
    </body>
    </html>`;
}

// list ๋ถ๋ถ์ ๋ฐ๋ณต๋ฌธ์ผ๋ก ๋ง๋๋ ํจ์
function templateList(fileList) {
  let list = '<ul>';
  let i = 0;
  while (i < fileList.length) {
    list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
    i++;
  }
  list = list + '</ul>';
  return list;
}

function makeList(fileList, title, description, control) {
  let _title = title;
  let _description = description;
  let list = templateList(fileList);
  let template = templateHTML(
    _title,
    list,
    `<h2>${_title}</h2><p>${_description}</p>`,
    control
  );
  return template;
}

const app = http.createServer((request, response) => {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;
  // pathname์ด '/'์ ๊ฐ๋ค๋ ๊ฒ์ home๊ณผ ๊ฐ๋ค๋ ๊ฒ
  if (pathname === '/') {
    // ์ด๊ธฐ ํ์ด์ง์ผ ๋์ ๊ทธ๋?์ง ์์ ๋๋ฅผ ๋๋
    if (queryData.id === undefined) {
      fs.readdir(DATA_DIR, (error, fileList) => {
        let template = makeList(
          fileList,
          WELCOME_TITLE,
          WELCOME_CONTENT,
          createBtn
        );
        response.writeHead(200);
        response.end(template);
      });
      // queryData.id๊ฐ ์กด์ฌํ? ๋
    } else {
      fs.readFile(`data/${queryData.id}`, 'utf8', (error, description) => {
        fs.readdir(DATA_DIR, (error, fileList) => {
          let template = makeList(
            fileList,
            queryData.id,
            description,
            updateBtn(queryData.id)
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === '/create') {
    fs.readdir(DATA_DIR, (error, fileList) => {
      let template = makeList(
        fileList,
        'Create your story',
        writingForm('create', '', ''),
        ''
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === '/create_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
      // To much POST data, kill the connection
      // 1e6 === 1 * Math.pow(10, 6) === 1* 1000000 ~~ 1MB
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on('end', () => {
      let post = qs.parse(body);
      let title = post.title;
      let description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
        if (err) throw err;
        response.writeHead(302, { Location: encodeURI(`/?id=${title}`) });
        response.end();
      });
    });
  } else if (pathname === '/update') {
    fs.readFile(`data/${queryData.id}`, 'utf8', (error, description) => {
      fs.readdir(DATA_DIR, (error, fileList) => {
        let template = makeList(
          fileList,
          'Update your writing',
          writingForm('update', queryData.id, description),
          ''
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathname === '/update_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on('end', () => {
      let post = qs.parse(body);
      let id = post.id; // ์ด๋ฒ์ id๊ฐ๋ ๋ฐ์์ค
      let title = post.title;
      let description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, (err) => {
        // ์?๋ชฉ์์?
        fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
          // ๋ด์ฉ๋ฐ์
          if (err) throw err;
          response.writeHead(302, { Location: encodeURI(`/?id=${title}`) });
          response.end();
        });
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
