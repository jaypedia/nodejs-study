const http = require('http');
const fs = require('fs');
const url = require('url');

// HTML에서 반복되는 마크업을 템플릿 함수로 작성
function templateHTML(title, list, body) {
  return `<!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
     ${list}
     ${body}
    </body>
    </html>`;
}

// list 부분을 반복문으로 만드는 함수
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

function makeList(fileList, title, description) {
  let _title = title;
  let _description = description;
  let list = templateList(fileList);
  let template = templateHTML(
    _title,
    list,
    `<h2>${_title}</h2><p>${_description}</p>`
  );
  return template;
}

const app = http.createServer((request, response) => {
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;

  // pathname이 '/'와 같은지 아닌지 검사함으로서 유효한 path인지 검사
  if (pathname === '/') {
    // 초기 페이지일 때와 그렇지 않을 때를 나눔
    if (queryData.id === undefined) {
      fs.readdir('./data', (error, fileList) => {
        let template = makeList(fileList, 'Welcome', 'Welcome to Node.js');
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readFile(`data/${queryData.id}`, 'utf8', (error, description) => {
        fs.readdir('./data', (error, fileList) => {
          let template = makeList(fileList, queryData.id, description);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
