var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'opentutorials',
});
db.connect();

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === '/') {
    if (queryData.id === undefined) {
      db.query('SELECT * FROM topic', (error, topics) => {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      db.query('SELECT * FROM topic', (error, topics) => {
        if (error) {
          throw error;
        }
        db.query(
          'SELECT * FROM topic left join author on topic.author_id = author.id WHERE topic.id=?',
          [queryData.id],
          (error2, topic) => {
            if (error2) {
              throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(
              title,
              list,
              `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`,
              ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          }
        );
      });
    }
  } else if (pathname === '/create') {
    db.query('SELECT * FROM topic', (error, topics) => {
      db.query('SELECT * FROM author', (error2, authors) => {
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(
          title,
          list,
          ` <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
             ${template.authorSelect(authors)}
            <p>
              <input type="submit">
            </p>
          </form>
        `,
          ''
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    // 이부분 이제 더이상 writeFile이 아니라 query 메소드 이용해서 데이터베이스에 데이터 추가되도록 변경해보자.
    request.on('end', function () {
      var post = qs.parse(body);
      db.query(
        `INSERT INTO topic (title, description, created, author_id)
      VALUES(?,?,NOW(), ?)`,
        [post.title, post.description, post.author],
        (error, result) => {
          if (error) {
            throw error;
          }
          // mysql api 사용법 - insertId 라는 것 (좀더 찾아보고 공부)
          response.writeHead(302, { Location: `/?id=${result.insertId}` });
          response.end();
        }
      );
    });
  } else if (pathname === '/update') {
    db.query('SELECT * FROM topic', (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(
        'SELECT * FROM topic WHERE id=?',
        [queryData.id],
        (error2, topic) => {
          if (error2) {
            throw error2;
          }
          db.query('SELECT * FROM author', (error2, authors) => {
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(
              title,
              list,
              ` <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${topic[0].id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          </p>
          ${template.authorSelect(authors, topic[0].author_id)}
         <p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
              ''
            );
            response.writeHead(200);
            response.end(html);
          });
        }
      );
    });
  } else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      console.log(post);
      db.query(
        'UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
        [post.title, post.description, post.author, post.id],
        (error, result) => {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: `/?id=${post.id}` });
          response.end();
        }
      );
    });
  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      db.query('DELETE FROM topic WHERE id=?', [post.id], (error, result) => {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
