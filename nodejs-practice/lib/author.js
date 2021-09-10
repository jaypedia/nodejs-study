var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
const db = require('./db');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
  db.query('SELECT * FROM topic', (error, topics) => {
    db.query('SELECT * FROM author', (error, authors) => {
      var title = 'Author';
      let list = template.list(topics);
      let html = template.HTML(
        title,
        list,
        `<form action="/author/create_process" method="post">
        <p><input type="text" name="name" placeholder="Author Name"></p>
        <p>
          <textarea name="profile" placeholder="Author profile"></textarea>
        </p>
        <p>
          <input type="submit" value="Create">
            </p>
            </form>`,
        `${template.authorTable(authors)}`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = (request, response) => {
  var body = '';
  request.on('data', function (data) {
    body += data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    db.query(
      'INSERT INTO author (name, profile) VALUES(?, ?)',
      [post.name, post.profile],
      (error, result) => {
        if (error) throw error;
        response.writeHead(302, { Location: '/author' });
        response.end();
      }
    );
  });
};

exports.update = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', (error, topics) => {
    db.query('SELECT * FROM author', (error, authors) => {
      db.query(
        'SELECT * FROM author WHERE id=?',
        [queryData.id],
        (error, author) => {
          var title = 'Author';
          let list = template.list(topics);
          let html = template.HTML(
            title,
            list,
            `<form action="/author/update_process" method="post">
                <input type="hidden" name="id" value="${sanitizeHtml(
                  author[0].id
                )}">
                  <p><input type="text" name="name" placeholder="Author Name"
                  value="${sanitizeHtml(author[0].name)}"></p>
                  <p>
                    <textarea name="profile" placeholder="Author profile">${sanitizeHtml(
                      author[0].profile
                    )}</textarea>
                  </p>
                  <p>
                    <input type="submit" value="Create">
                      </p>
                      </form>`,
            `${template.authorTable(authors)}`
          );
          response.writeHead(200);
          response.end(html);
        }
      );
    });
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
      'UPDATE author SET name=?, profile=? WHERE id=?',
      [post.name, post.profile, post.id],
      (error, result) => {
        if (error) throw error;
        response.writeHead(302, { Location: `/author` });
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
    db.query(
      'DELETE FROM topic where author_id=?',
      [post.id],
      (error, result) => {
        if (error) throw error;
      }
    );

    db.query('DELETE FROM author where id=?', [post.id], (error, result) => {
      response.writeHead(302, { Location: `/author` });
      response.end();
    });
  });
};
