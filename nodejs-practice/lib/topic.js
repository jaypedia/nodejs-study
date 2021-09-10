var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
const db = require('./db');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
  db.query('SELECT * FROM topic', (error, topics) => {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    let list = template.list(topics);
    let html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
};

exports.page = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', (error, topics) => {
    if (error) throw error;
    db.query(
      'select * from topic left join author on topic.author_id = author.id where topic.id=?',
      [queryData.id],
      (error, topic) => {
        if (error) throw error;
        var title = topic[0].title;
        var description = topic[0].description;
        var authorName = topic[0].name;
        let list = template.list(topics);
        let html = template.HTML(
          title,
          list,
          `<h2>${sanitizeHtml(title)}</h2>${sanitizeHtml(
            description
          )}<p>by ${sanitizeHtml(authorName)}</p>`,
          `<a href="/create">create👾</a>
              <a href="/update?id=${queryData.id}">update🤖</a>
              <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                  </form>
              `
        );
        response.writeHead(200);
        response.end(html);
      }
    );
  });
};

exports.create = (request, response) => {
  db.query('SELECT * FROM topic', (error, topics) => {
    db.query('select * from author;', (error, authors) => {
      var title = 'Create';
      let list = template.list(topics);
      let html = template.HTML(
        sanitizeHtml(title),
        list,
        `<form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
         ${template.authorSelect(authors)}
          <p>
            <input type="submit">
          </p>
        </form>`,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = (request, response) => {
  var body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    db.query(
      'INSERT INTO topic (title, description, created, author_id) values (?, ?, NOW(), ?)',
      [post.title, post.description, post.author],
      (error, result) => {
        if (error) throw error;
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

exports.update = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', (error, topics) => {
    if (error) throw error;
    db.query(
      'SELECT * from topic where id=?',
      [queryData.id],
      (error, topic) => {
        if (error) throw error;
        db.query('select * from author;', (error, authors) => {
          var title = topic[0].title;
          var description = topic[0].description;
          let list = template.list(topics);
          let html = template.HTML(
            title,
            list,
            ` <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(
                  title
                )}"></p>
                <p>
                  <textarea name="description" placeholder="description">${sanitizeHtml(
                    description
                  )}</textarea>
                </p>
                ${template.authorSelect(authors, topic[0].author_id)}
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      }
    );
  });
};

exports.update_process = (request, response) => {
  var body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    db.query(
      'UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
      [post.title, post.description, post.author, post.id],
      (error, result) => {
        if (error) throw error;
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    );
  });
};

exports.delete_process = (request, response) => {
  var body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    db.query('DELETE FROM topic where id=?', [post.id], (error, result) => {
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};
